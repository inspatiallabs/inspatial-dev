// Core Rendering Engine (Renderer 2)
export interface RenderTarget {
  colorTexture: GPUTexture;
  depthTexture: GPUTexture;
  width: number;
  height: number;
}

export interface ShaderModule {
  vertex: GPUShaderModule;
  fragment: GPUShaderModule;
}

export interface PipelineConfig {
  shader: ShaderModule;
  vertexBufferLayout?: GPUVertexBufferLayout[];
  colorTargetStates?: GPUColorTargetState[];
  depthStencil?: GPUDepthStencilState;
  bindGroupLayouts?: GPUBindGroupLayout[];
}

export class GPURenderer {
  private device: GPUDevice;
  private context: GPUCanvasContext | null = null;
  private pipelines: Map<string, GPURenderPipeline> = new Map();
  private bindGroups: Map<string, GPUBindGroup> = new Map();
  private renderTargets: Map<string, RenderTarget> = new Map();

  constructor(device: GPUDevice) {
    this.device = device;
  }

  async initialize(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("webgpu");
    if (!context) throw new Error("WebGPU context not available");
    this.context = context;

    const format = navigator.gpu.getPreferredCanvasFormat();
    const configuration: GPUCanvasConfiguration = {
      device: this.device,
      format,
      alphaMode: "premultiplied",
    };

    context.configure(configuration);
  }

  createRenderTarget(id: string, width: number, height: number): RenderTarget {
    const colorTexture = this.device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    const depthTexture = this.device.createTexture({
      size: [width, height],
      format: "depth24plus",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    const renderTarget = { colorTexture, depthTexture, width, height };
    this.renderTargets.set(id, renderTarget);
    return renderTarget;
  }

  async createPipeline(id: string, config: PipelineConfig) {
    const pipeline = await this.device.createRenderPipelineAsync({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: config.bindGroupLayouts || [],
      }),
      vertex: {
        module: config.shader.vertex,
        entryPoint: "main",
        buffers: config.vertexBufferLayout || [],
      },
      fragment: {
        module: config.shader.fragment,
        entryPoint: "main",
        targets: config.colorTargetStates || [
          {
            format: "rgba8unorm",
          },
        ],
      },
      depthStencil: config.depthStencil,
    });

    this.pipelines.set(id, pipeline);
    return pipeline;
  }

  createBindGroup(
    id: string,
    layout: GPUBindGroupLayout,
    entries: GPUBindGroupEntry[]
  ) {
    const bindGroup = this.device.createBindGroup({
      layout,
      entries,
    });
    this.bindGroups.set(id, bindGroup);
    return bindGroup;
  }

  beginRenderPass(
    encoder: GPUCommandEncoder,
    renderTarget: RenderTarget,
    clearColor?: GPUColor
  ) {
    return encoder.beginRenderPass({
      colorAttachments: [
        {
          view: renderTarget.colorTexture.createView(),
          clearValue: clearColor || { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: renderTarget.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });
  }

  async loadShader(
    vertexCode: string,
    fragmentCode: string
  ): Promise<ShaderModule> {
    const vertex = this.device.createShaderModule({
      code: vertexCode,
    });

    const fragment = this.device.createShaderModule({
      code: fragmentCode,
    });

    return { vertex, fragment };
  }

  getRenderTarget(id: string): RenderTarget | undefined {
    return this.renderTargets.get(id);
  }

  getPipeline(id: string): GPURenderPipeline | undefined {
    return this.pipelines.get(id);
  }

  getBindGroup(id: string): GPUBindGroup | undefined {
    return this.bindGroups.get(id);
  }

  getDevice(): GPUDevice {
    return this.device;
  }

  getContext(): GPUCanvasContext | null {
    return this.context;
  }

  resize(renderTargetId: string, width: number, height: number) {
    const oldTarget = this.renderTargets.get(renderTargetId);
    if (oldTarget) {
      oldTarget.colorTexture.destroy();
      oldTarget.depthTexture.destroy();
      this.createRenderTarget(renderTargetId, width, height);
    }
  }

  dispose() {
    for (const renderTarget of this.renderTargets.values()) {
      renderTarget.colorTexture.destroy();
      renderTarget.depthTexture.destroy();
    }
    this.renderTargets.clear();
    this.pipelines.clear();
    this.bindGroups.clear();
  }
}

// Higher-Level Abstractions (Renderer 1)
export interface GPUNode {
  type: string;
  props: any;
  target: string;
  children?: GPUNode[];
}

export class SceneManager {
  private renderer: GPURenderer;
  private sceneGraph: GPUNode[] = [];

  constructor(renderer: GPURenderer) {
    this.renderer = renderer;
  }

  createElement(type: string, props: any): GPUNode {
    switch (type) {
      case "mesh":
        return this.createMesh(props);
      case "material":
        return this.createMaterial(props);
      case "geometry":
        return this.createGeometryNode(props);
      default:
        throw new Error(`Unknown GPU element type: ${type}`);
    }
  }

  private createMesh(props: any): GPUNode {
    return {
      type: "mesh",
      props,
      target: "gpu",
      children: [],
    };
  }

  private createMaterial(props: any): GPUNode {
    return {
      type: "material",
      props,
      target: "gpu",
    };
  }

  private createGeometryNode(props: any): GPUNode {
    return {
      type: "geometry",
      props,
      target: "gpu",
    };
  }

  addToScene(node: GPUNode) {
    this.sceneGraph.push(node);
  }

  renderScene() {
    // Traverse the scene graph and render each node
    for (const node of this.sceneGraph) {
      this.renderNode(node);
    }
  }

  private renderNode(node: GPUNode) {
    // Implement rendering logic for each node type
    switch (node.type) {
      case "mesh":
        this.renderMesh(node);
        break;
      case "material":
        this.renderMaterial(node);
        break;
      case "geometry":
        this.renderGeometry(node);
        break;
      default:
        console.warn(`Unsupported node type: ${node.type}`);
    }
  }

  private renderMesh(node: GPUNode) {
    // Render mesh using the core renderer
    console.log("Rendering mesh:", node);
  }

  private renderMaterial(node: GPUNode) {
    // Render material using the core renderer
    console.log("Rendering material:", node);
  }

  private renderGeometry(node: GPUNode) {
    // Render geometry using the core renderer
    console.log("Rendering geometry:", node);
  }
}

// Usage Example
async function main() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  const renderer = new GPURenderer(device);
  await renderer.initialize(canvas);

  const sceneManager = new SceneManager(renderer);
  const mesh = sceneManager.createElement("mesh", {
    vertices: [
      /*...*/
    ],
  });
  sceneManager.addToScene(mesh);

  sceneManager.renderScene();
}

main();
