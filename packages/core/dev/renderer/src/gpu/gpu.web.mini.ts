// @ts-ignore - Ignoring TS extension import error
import { GPUNode } from "../types.ts";

// WebGPU type definitions
// These are placeholders until proper WebGPU types are available
type GPUTexture = any;
type GPUCanvasContext = any;
type GPUDevice = any;
type GPUShaderModule = any;
type GPUVertexBufferLayout = any;
type GPUColorTargetState = any;
type GPUDepthStencilState = any;
type GPUBindGroupLayout = any;
type GPUBindGroupEntry = any;
type GPUCommandEncoder = any;
type GPUColor = any;
type GPURenderPipeline = any;
type GPUBindGroup = any;

// Mini GPU Rendering Engine
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

export class GPURendererMini {
  private static instance: GPURendererMini;
  private device: GPUDevice;
  private context: GPUCanvasContext | null = null;
  private pipelines: Map<string, GPURenderPipeline> = new Map();
  private bindGroups: Map<string, GPUBindGroup> = new Map();
  private renderTargets: Map<string, RenderTarget> = new Map();

  private constructor(device: GPUDevice) {
    this.device = device;
  }

  static getInstance(device?: GPUDevice): GPURendererMini {
    if (!GPURendererMini.instance) {
      if (!device) {
        throw new Error(
          "Device must be provided for the first initialization."
        );
      }
      GPURendererMini.instance = new GPURendererMini(device);
    }
    return GPURendererMini.instance;
  }

  async initialize(canvas: HTMLCanvasElement) {
    // First check if WebGPU is available
    if (!('gpu' in navigator)) {
      throw new Error("WebGPU is not supported in this browser");
    }
  
    // Use a double assertion via unknown to satisfy TypeScript's type checking
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
    
    // Still do a runtime check to make sure we actually got a context
    if (!context) {
      throw new Error("WebGPU context not available");
    }
    
    this.context = context;
  
    const format = navigator.gpu.getPreferredCanvasFormat();
    const configuration: GPUCanvasConfiguration = {
      device: this.device,
      format,
      alphaMode: "premultiplied",
    };
  
    context.configure(configuration);
  }

  
  createElement(type: string, props: any, ...children: any[]): GPUNode {
    return {
      type,
      props: { ...props, children },
      target: "gpu",
    };
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

  async createTypePipeline(id: string, config: PipelineConfig) {
    const pipeline = await this.device.createRenderPipelineAsync({
      layout: this.device.createTypePipelineLayout({
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

export class SceneManager {
  private renderer: GPURendererMini;
  private sceneGraph: GPUNode[] = [];

  constructor(renderer: GPURendererMini) {
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
// async function main() {
//   const canvas = document.querySelector("canvas") as HTMLCanvasElement;
//   const adapter = await navigator.gpu.requestAdapter();
//   const device = await adapter!.requestDevice();

//   setDirectiveRenderTargetProp("gpu"); // Set the render target to GPU

//   const renderer = GPURendererMini.getInstance(device);
//   await renderer.initialize(canvas);

//   const sceneManager = new SceneManager(renderer);
//   const mesh = sceneManager.createElement("mesh", {
//     vertices: [
//       /*...*/
//     ],
//   });
//   sceneManager.addToScene(mesh);

//   sceneManager.renderScene();
// }

// main();
