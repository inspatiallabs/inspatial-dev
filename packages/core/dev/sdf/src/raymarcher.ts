import * as THREE from "three";
import { GPURenderer, RenderTarget } from "@inspatial/renderer/gpu";
import lighting from "./shaders/lighting.glsl";
import raymarcherFragment from "./shaders/raymarcher.frag";
import raymarcherVertex from "./shaders/raymarcher.vert";
import screenFragment from "./shaders/screen.frag";
import screenVertex from "./shaders/screen.vert";
import raymarcherWGSL from "./shaders/raymarcher.wgsl";
import screenWGSL from "./shaders/screen.wgsl";

interface Entity {
  color: THREE.Color;
  operation: number;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  shape: number;
}

interface Layer {
  bounds: THREE.Sphere;
  distance: number;
  entities: Entity[];
}

interface RaymarcherUserData {
  blending: number;
  conetracing: boolean;
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  metalness: number;
  layers: Entity[][];
  resolution: number;
  roughness: number;
  raymarcher: THREE.Mesh;
  target: THREE.WebGLRenderTarget;
}

const _bounds: THREE.Sphere[] = [];
const _colliders: THREE.Mesh[] = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.CylinderGeometry(0.5, 0.5, 1),
  new THREE.IcosahedronGeometry(0.5, 2),
].map((geometry) => {
  geometry.computeBoundingSphere();
  return new THREE.Mesh(geometry);
});
const _frustum = new THREE.Frustum();
const _position = new THREE.Vector3();
const _projection = new THREE.Matrix4();
const _size = new THREE.Vector2();
const _sphere = new THREE.Sphere();

class Raymarcher extends THREE.Mesh {
  private renderer: GPURenderer | THREE.WebGLRenderer;
  private gpuRenderTarget: RenderTarget | null = null;
  private gpuBindGroups: Map<string, GPUBindGroup> = new Map();
  private uniformBuffers: Map<string, GPUBuffer> = new Map();
  private entityBuffers: Map<string, GPUBuffer> = new Map();
  public userData: RaymarcherUserData;

  constructor({
    blending = 0.5,
    conetracing = true,
    envMap = null,
    envMapIntensity = 1,
    metalness = 0,
    layers = [],
    resolution = 1,
    roughness = 1,
  } = {}) {
    // WebGL setup
    const plane = new THREE.PlaneGeometry(2, 2, 1, 1);
    plane.deleteAttribute("normal");
    plane.deleteAttribute("uv");

    const target = new THREE.WebGLRenderTarget(1, 1, {
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedShortType),
    });

    const screen = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      transparent: !!conetracing,
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      uniforms: {
        colorTexture: { value: target.texture },
        depthTexture: { value: target.depthTexture },
      },
    });

    super(plane, screen);

    const material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      transparent: !!conetracing,
      vertexShader: raymarcherVertex,
      fragmentShader: raymarcherFragment.replace(
        "#include <lighting>",
        lighting
      ),
      defines: {
        CONETRACING: !!conetracing,
        MAX_ENTITIES: 0,
        MAX_DISTANCE: "1000.0",
        MAX_ITERATIONS: 200,
        MIN_COVERAGE: "0.02",
        MIN_DISTANCE: "0.05",
      },
      uniforms: {
        blending: { value: blending },
        bounds: { value: { center: new THREE.Vector3(), radius: 0 } },
        cameraDirection: { value: new THREE.Vector3() },
        cameraFar: { value: 0 },
        cameraFov: { value: 0 },
        cameraNear: { value: 0 },
        envMap: { value: null },
        envMapIntensity: { value: envMapIntensity },
        metalness: { value: metalness },
        resolution: { value: new THREE.Vector2() },
        roughness: { value: roughness },
        numEntities: { value: 0 },
        entities: {
          value: [],
          properties: {
            color: {},
            operation: {},
            position: {},
            rotation: {},
            scale: {},
            shape: {},
          },
        },
      },
    });

    const { defines, uniforms } = material;
    this.userData = {
      get blending() {
        return uniforms.blending.value;
      },
      set blending(value) {
        uniforms.blending.value = value;
      },
      get conetracing() {
        return defines.CONETRACING;
      },
      set conetracing(value) {
        if (defines.CONETRACING !== !!value) {
          defines.CONETRACING = !!value;
          material.transparent = screen.transparent = !!value;
          material.needsUpdate = true;
        }
      },
      get envMap() {
        return uniforms.envMap.value;
      },
      set envMap(value) {
        uniforms.envMap.value = value;
        if (defines.ENVMAP_TYPE_CUBE_UV !== !!value) {
          defines.ENVMAP_TYPE_CUBE_UV = !!value;
          material.needsUpdate = true;
        }
        if (value) {
          const maxMip = Math.log2(value.image.height) - 2;
          const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
          const texelHeight = 1.0 / value.image.height;
          if (defines.CUBEUV_MAX_MIP !== `${maxMip}.0`) {
            defines.CUBEUV_MAX_MIP = `${maxMip}.0`;
            material.needsUpdate = true;
          }
          if (defines.CUBEUV_TEXEL_WIDTH !== texelWidth) {
            defines.CUBEUV_TEXEL_WIDTH = texelWidth;
            material.needsUpdate = true;
          }
          if (defines.CUBEUV_TEXEL_HEIGHT !== texelHeight) {
            defines.CUBEUV_TEXEL_HEIGHT = texelHeight;
            material.needsUpdate = true;
          }
        }
      },
      get envMapIntensity() {
        return uniforms.envMapIntensity.value;
      },
      set envMapIntensity(value) {
        uniforms.envMapIntensity.value = value;
      },
      get metalness() {
        return uniforms.metalness.value;
      },
      set metalness(value) {
        uniforms.metalness.value = value;
      },
      get roughness() {
        return uniforms.roughness.value;
      },
      set roughness(value) {
        uniforms.roughness.value = value;
      },
      layers,
      raymarcher: new THREE.Mesh(plane, material),
      resolution,
      target,
    };

    this.matrixAutoUpdate = this.userData.raymarcher.matrixAutoUpdate = false;
    this.frustumCulled = this.userData.raymarcher.frustumCulled = false;
    if (envMap) {
      this.userData.envMap = envMap;
    }

    // Initialize renderer and appropriate setup
    this.initRenderer().then(() => {
      if (this.renderer instanceof GPURenderer) {
        this.initializeWebGPU({
          blending,
          conetracing,
          envMap,
          envMapIntensity,
          metalness,
          roughness,
        });
      }
    });
  }

  private async initRenderer() {
    try {
      if (navigator.gpu) {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error("No adapter found");
        const device = await adapter.requestDevice();
        this.renderer = new GPURenderer(device);
        return;
      }
    } catch (e) {
      console.log("WebGPU initialization failed, falling back to WebGL", e);
    }
    this.renderer = new THREE.WebGLRenderer();
  }

  private async initializeWebGPU(options: {
    blending: number;
    conetracing: boolean;
    envMap: THREE.Texture | null;
    envMapIntensity: number;
    metalness: number;
    roughness: number;
  }) {
    if (!(this.renderer instanceof GPURenderer)) return;

    // Create uniform buffers
    const cameraUniformBuffer = this.renderer.getDevice().createBuffer({
      size: 96, // size of camera uniforms
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const renderParamsBuffer = this.renderer.getDevice().createBuffer({
      size: 32, // size of render params
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBuffers.set("camera", cameraUniformBuffer);
    this.uniformBuffers.set("renderParams", renderParamsBuffer);

    // Create entity storage buffer
    const entityBuffer = this.renderer.getDevice().createBuffer({
      size: 16384, // Adjust size based on MAX_ENTITIES
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.entityBuffers.set("entities", entityBuffer);

    // Create bind group layouts
    const bindGroupLayout = this.renderer.getDevice().createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "storage" },
        },
      ],
    });

    // Create bind group
    this.gpuBindGroups.set(
      "main",
      this.renderer.createBindGroup("main", bindGroupLayout, [
        { binding: 0, resource: { buffer: cameraUniformBuffer } },
        { binding: 1, resource: { buffer: renderParamsBuffer } },
        { binding: 2, resource: { buffer: entityBuffer } },
      ])
    );

    // Create pipelines
    await this.renderer.createPipeline("raymarcher", {
      shader: await this.renderer.loadShader(raymarcherWGSL, raymarcherWGSL),
      bindGroupLayouts: [bindGroupLayout],
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });

    await this.renderer.createPipeline("screen", {
      shader: await this.renderer.loadShader(screenWGSL, screenWGSL),
      bindGroupLayouts: [bindGroupLayout],
    });

    // Create render targets
    this.gpuRenderTarget = this.renderer.createRenderTarget(
      "main",
      window.innerWidth,
      window.innerHeight
    );
  }

  onBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ): void {
    if (this.renderer instanceof GPURenderer) {
      this.renderWebGPU(camera);
    } else {
      this.renderWebGL(renderer, camera);
    }
  }

  private updateUniformBuffers(camera: THREE.Camera) {
    if (!(this.renderer instanceof GPURenderer)) return;

    const device = this.renderer.getDevice();

    // Update camera uniforms
    const cameraBuffer = this.uniformBuffers.get("camera");
    if (cameraBuffer) {
      const cameraData = new Float32Array([
        ...camera.matrixWorld.elements,
        ...camera.getWorldDirection(new THREE.Vector3()).toArray(),
        camera.position.x,
        camera.position.y,
        camera.position.z,
        THREE.MathUtils.degToRad(camera.fov),
        camera.near,
        camera.far,
        window.innerWidth,
        window.innerHeight,
      ]);
      device.queue.writeBuffer(cameraBuffer, 0, cameraData.buffer);
    }

    // Update render params
    const renderParamsBuffer = this.uniformBuffers.get("renderParams");
    if (renderParamsBuffer) {
      const { blending, envMapIntensity, metalness, roughness } = this.userData;
      const renderParamsData = new Float32Array([
        blending,
        envMapIntensity,
        metalness,
        roughness,
        this.userData.layers.reduce((count, layer) => count + layer.length, 0),
      ]);
      device.queue.writeBuffer(renderParamsBuffer, 0, renderParamsData.buffer);
    }
  }

  private updateEntityBuffer() {
    if (!(this.renderer instanceof GPURenderer)) return;

    const device = this.renderer.getDevice();
    const entityBuffer = this.entityBuffers.get("entities");
    if (entityBuffer) {
      const entities = this.userData.layers.flat();
      const entityData = new Float32Array(entities.length * 16); // Adjust size based on entity structure

      let offset = 0;
      entities.forEach((entity) => {
        // Pack entity data
        entityData.set(
          [
            entity.color.r,
            entity.color.g,
            entity.color.b,
            entity.operation,
            entity.position.x,
            entity.position.y,
            entity.position.z,
            entity.rotation.x,
            entity.rotation.y,
            entity.rotation.z,
            entity.rotation.w,
            entity.scale.x,
            entity.scale.y,
            entity.scale.z,
            entity.shape,
          ],
          offset
        );
        offset += 16;
      });

      device.queue.writeBuffer(entityBuffer, 0, entityData.buffer);
    }
  }

  private renderWebGPU(camera: THREE.Camera) {
    if (!this.gpuRenderTarget || !(this.renderer instanceof GPURenderer))
      return;

    const device = this.renderer.getDevice();
    const commandEncoder = device.createCommandEncoder();

    // Update uniforms and entities
    this.updateUniformBuffers(camera);
    this.updateEntityBuffer();

    // Ray marching pass
    const raymarchPass = this.renderer.beginRenderPass(
      commandEncoder,
      this.gpuRenderTarget
    );

    const raymarchPipeline = this.renderer.getPipeline("raymarcher");
    if (raymarchPipeline) {
      raymarchPass.setPipeline(raymarchPipeline);

      // Set bind groups
      const bindGroup = this.gpuBindGroups.get("main");
      if (bindGroup) {
        raymarchPass.setBindGroup(0, bindGroup);
      }

      raymarchPass.draw(6, 1, 0, 0); // Full screen quad
    }
    raymarchPass.end();

    // Screen pass
    const screenPass = this.renderer.beginRenderPass(
      commandEncoder,
      this.gpuRenderTarget
    );

    const screenPipeline = this.renderer.getPipeline("screen");
    if (screenPipeline) {
      screenPass.setPipeline(screenPipeline);
      // Set bind groups for screen pass
      const bindGroup = this.gpuBindGroups.get("screen");
      if (bindGroup) {
        screenPass.setBindGroup(0, bindGroup);
      }
      screenPass.draw(6, 1, 0, 0);
    }
    screenPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  private renderWebGL(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    const {
      userData: { layers, resolution, raymarcher, target },
    } = this;
    const {
      material: { defines, uniforms },
    } = raymarcher;

    camera.getWorldDirection(uniforms.cameraDirection.value);
    uniforms.cameraFar.value = camera.far;
    uniforms.cameraFov.value = THREE.MathUtils.degToRad(camera.fov);
    uniforms.cameraNear.value = camera.near;

    _frustum.setFromProjectionMatrix(
      _projection.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    camera.getWorldPosition(_position);
    const sortedLayers = layers
      .reduce((layers: Layer[], entities, layer) => {
        if (defines.MAX_ENTITIES < entities.length) {
          defines.MAX_ENTITIES = entities.length;
          uniforms.entities.value = entities.map(Raymarcher.cloneEntity);
          raymarcher.material.needsUpdate = true;
        }
        const bounds = Raymarcher.getLayerBounds(layer);
        entities.forEach((entity) => {
          const {
            geometry: { boundingSphere },
            matrixWorld,
          } = Raymarcher.getEntityCollider(entity);
          _sphere.copy(boundingSphere).applyMatrix4(matrixWorld);
          if (bounds.isEmpty()) {
            bounds.copy(_sphere);
          } else {
            bounds.union(_sphere);
          }
        });
        if (_frustum.intersectsSphere(bounds)) {
          layers.push({
            bounds,
            distance: bounds.center.distanceTo(_position),
            entities,
          });
        }
        return layers;
      }, [])
      .sort(({ distance: a }, { distance: b }) =>
        defines.CONETRACING ? b - a : a - b
      );

    renderer.getDrawingBufferSize(_size).multiplyScalar(resolution).floor();
    if (target.width !== _size.x || target.height !== _size.y) {
      target.setSize(_size.x, _size.y);
      uniforms.resolution.value.copy(_size);
    }

    const currentAutoClear = renderer.autoClear;
    const currentClearAlpha = renderer.getClearAlpha();
    const currentRenderTarget = renderer.getRenderTarget();
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    const currentXrEnabled = renderer.xr.enabled;
    renderer.autoClear = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.xr.enabled = false;
    renderer.setClearAlpha(0);
    renderer.setRenderTarget(target);
    renderer.state.buffers.depth.setMask(true);

    renderer.clear();
    sortedLayers.forEach(({ bounds, entities }) => {
      uniforms.bounds.value.center.copy(bounds.center);
      uniforms.bounds.value.radius = bounds.radius;
      uniforms.numEntities.value = entities.length;
      entities.forEach(
        ({ color, operation, position, rotation, scale, shape }, i) => {
          const uniform = uniforms.entities.value[i];
          uniform.color.copy(color);
          uniform.operation = operation;
          uniform.position.copy(position);
          uniform.rotation.copy(rotation);
          uniform.scale.copy(scale);
          uniform.shape = shape;
        }
      );
      renderer.render(raymarcher, camera);
    });

    renderer.autoClear = currentAutoClear;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.xr.enabled = currentXrEnabled;
    renderer.setClearAlpha(currentClearAlpha);
    renderer.setRenderTarget(currentRenderTarget);
    if (camera.viewport) renderer.state.viewport(camera.viewport);
  }

  copy(source: Raymarcher): this {
    const { userData } = this;
    const {
      userData: {
        blending,
        conetracing,
        envMap,
        envMapIntensity,
        metalness,
        layers,
        resolution,
        roughness,
      },
    } = source;
    userData.blending = blending;
    userData.conetracing = conetracing;
    userData.envMap = envMap;
    userData.envMapIntensity = envMapIntensity;
    userData.metalness = metalness;
    userData.layers = layers.map((layer) => layer.map(Raymarcher.cloneEntity));
    userData.resolution = resolution;
    userData.roughness = roughness;
    return this;
  }

  dispose(): void {
    const {
      material,
      geometry,
      userData: { raymarcher, target },
    } = this;

    material.dispose();
    geometry.dispose();
    raymarcher.material.dispose();
    target.dispose();
    target.depthTexture.dispose();
    target.texture.dispose();

    if (this.renderer instanceof GPURenderer) {
      this.uniformBuffers.forEach((buffer) => buffer.destroy());
      this.entityBuffers.forEach((buffer) => buffer.destroy());
      this.uniformBuffers.clear();
      this.entityBuffers.clear();
      this.gpuBindGroups.clear();
      if (this.gpuRenderTarget) {
        this.gpuRenderTarget.colorTexture.destroy();
        this.gpuRenderTarget.depthTexture.destroy();
      }
    }
  }

  static cloneEntity({
    color,
    operation,
    position,
    rotation,
    scale,
    shape,
  }: Entity): Entity {
    return {
      color: color.clone(),
      operation,
      position: position.clone(),
      rotation: rotation.clone(),
      scale: scale.clone(),
      shape,
    };
  }

  static getEntityCollider({
    position,
    rotation,
    scale,
    shape,
  }: Entity): THREE.Mesh {
    const collider = _colliders[shape];
    collider.position.copy(position);
    collider.quaternion.copy(rotation);
    collider.scale.copy(scale);
    if (shape === Raymarcher.shapes.capsule) {
      collider.scale.z = collider.scale.x;
    }
    collider.updateMatrixWorld();
    return collider;
  }

  static getLayerBounds(layer: number): THREE.Sphere {
    if (!_bounds[layer]) {
      _bounds[layer] = new THREE.Sphere();
    }
    return _bounds[layer].makeEmpty();
  }

  static operations = {
    union: 0,
    substraction: 1,
    intersection: 2,
  };

  static shapes = {
    box: 0,
    capsule: 1,
    sphere: 2,
  };
}

export default Raymarcher;
