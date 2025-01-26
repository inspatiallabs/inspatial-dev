// Constants
const MAX_ENTITIES = 16;
const MAX_ITERATIONS = 128;
const MAX_DISTANCE = 100.0;
const MIN_DISTANCE = 0.001;
const MIN_COVERAGE = 0.01;

// Shared structures
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) ray: vec3<f32>,
};

struct CameraUniforms {
    viewMatrix: mat4x4<f32>,
    cameraDirection: vec3<f32>,
    cameraPosition: vec3<f32>,
    cameraFov: f32,
    cameraNear: f32,
    cameraFar: f32,
    resolution: vec2<f32>,
};

struct Bounds {
    center: vec3<f32>,
    radius: f32,
};

struct Entity {
    color: vec3<f32>,
    operation: i32,
    position: vec3<f32>,
    rotation: vec4<f32>,
    scale: vec3<f32>,
    shape: i32,
};

struct RenderUniforms {
    blending: f32,
    envMapIntensity: f32,
    metalness: f32,
    roughness: f32,
    numEntities: i32,
};

struct SDF {
    distance: f32,
    color: vec3<f32>,
};

// Bindings
@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(0) @binding(1) var<uniform> bounds: Bounds;
@group(0) @binding(2) var<storage> entities: array<Entity>;
@group(0) @binding(3) var envMapTexture: texture_2d<f32>;
@group(0) @binding(4) var envMapSampler: sampler;
@group(0) @binding(5) var<uniform> renderParams: RenderUniforms;

// Helper functions
fn saturate(x: f32) -> f32 {
    return clamp(x, 0.0, 1.0);
}

fn applyQuaternion(p: vec3<f32>, q: vec4<f32>) -> vec3<f32> {
    return p + 2.0 * cross(-q.xyz, cross(-q.xyz, p) + q.w * p);
}

fn sdBox(p: vec3<f32>, r: vec3<f32>) -> f32 {
    let q = abs(p) - r;
    return length(max(q, vec3<f32>(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn sdCapsule(p: vec3<f32>, r: vec3<f32>) -> f32 {
    var p_mod = p;
    p_mod.y -= clamp(p_mod.y, -r.y + r.x, r.y - r.x);
    return length(p_mod) - r.x;
}

fn sdEllipsoid(p: vec3<f32>, r: vec3<f32>) -> f32 {
    let k0 = length(p / r);
    let k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

fn sdSphere(p: vec3<f32>, r: f32) -> f32 {
    return length(p) - r;
}

fn sdEntity(p: vec3<f32>, e: Entity) -> SDF {
    var p_transformed = applyQuaternion(p - e.position, normalize(e.rotation));
    var distance: f32;
    
    switch e.shape {
        case 0: { // Box
            distance = sdBox(p_transformed, e.scale * 0.5 - vec3<f32>(0.1)) - 0.1;
        }
        case 1: { // Capsule
            distance = sdCapsule(p_transformed, e.scale * 0.5);
        }
        default: { // Ellipsoid
            distance = sdEllipsoid(p_transformed, e.scale * 0.5);
        }
    }
    
    return SDF(distance, e.color);
}

fn opSmoothUnion(a: SDF, b: SDF, k: f32) -> SDF {
    let h = saturate(0.5 + 0.5 * (b.distance - a.distance) / k);
    return SDF(
        mix(b.distance, a.distance, h) - k * h * (1.0 - h),
        mix(b.color, a.color, h)
    );
}

fn opSmoothSubtraction(a: SDF, b: SDF, k: f32) -> SDF {
    let h = saturate(0.5 - 0.5 * (a.distance + b.distance) / k);
    return SDF(
        mix(a.distance, -b.distance, h) + k * h * (1.0 - h),
        mix(a.color, b.color, h)
    );
}

fn opSmoothIntersection(a: SDF, b: SDF, k: f32) -> SDF {
    let h = saturate(0.5 + 0.5 * (b.distance - a.distance) / k);
    return SDF(
        mix(a.distance, b.distance, h) + k * h * (1.0 - h),
        mix(a.color, b.color, h)
    );
}

fn map(p: vec3<f32>) -> SDF {
    var scene = sdEntity(p, entities[0]);
    
    for (var i = 1; i < renderParams.numEntities && i < MAX_ENTITIES; i++) {
        switch entities[i].operation {
            case 0: { // Union
                scene = opSmoothUnion(scene, sdEntity(p, entities[i]), renderParams.blending);
            }
            case 1: { // Subtraction
                scene = opSmoothSubtraction(scene, sdEntity(p, entities[i]), renderParams.blending);
            }
            case 2: { // Intersection
                scene = opSmoothIntersection(scene, sdEntity(p, entities[i]), renderParams.blending);
            }
            default: {}
        }
    }
    return scene;
}

fn getNormal(p: vec3<f32>, d: f32) -> vec3<f32> {
    let o = vec2<f32>(0.001, 0.0);
    return normalize(d - vec3<f32>(
        map(p - vec3<f32>(o.x, o.y, o.y)).distance,
        map(p - vec3<f32>(o.y, o.x, o.y)).distance,
        map(p - vec3<f32>(o.y, o.y, o.x)).distance
    ));
}

// Lighting calculation (simplified for WGSL)
fn getLight(position: vec3<f32>, normal: vec3<f32>, color: vec3<f32>) -> vec3<f32> {
    let lightDir = normalize(vec3<f32>(1.0, 1.0, -1.0));
    let diffuse = max(dot(normal, lightDir), 0.0);
    let ambient = 0.1;
    return color * (diffuse + ambient);
}

fn march(ray: vec3<f32>) -> vec4<f32> {
    var color = vec4<f32>(0.0);
    var distance = camera.cameraNear;
    var closest = MAX_DISTANCE;
    
    #ifdef CONETRACING
    var coverage = 1.0;
    let coneRadius = (2.0 * tan(camera.cameraFov / 2.0)) / camera.resolution.y;
    
    for (var i = 0; i < MAX_ITERATIONS && distance < MAX_DISTANCE; i++) {
        let position = camera.cameraPosition + ray * distance;
        let distanceToBounds = sdSphere(position - bounds.center, bounds.radius);
        
        if (distanceToBounds > 0.1) {
            distance += distanceToBounds;
        } else {
            let step = map(position);
            let cone = coneRadius * distance;
            
            if (step.distance < cone) {
                if (closest > distance) {
                    closest = distance;
                }
                let alpha = smoothstep(cone, -cone, step.distance);
                let pixel = getLight(position, getNormal(position, step.distance), step.color);
                color.rgb += coverage * (alpha * pixel);
                coverage *= (1.0 - alpha);
                
                if (coverage <= MIN_COVERAGE) {
                    break;
                }
            }
            distance += max(abs(step.distance), MIN_DISTANCE);
        }
    }
    color.a = 1.0 - (max(coverage - MIN_COVERAGE, 0.0) / (1.0 - MIN_COVERAGE));
    
    #else
    
    for (var i = 0; i < MAX_ITERATIONS && distance < MAX_DISTANCE; i++) {
        let position = camera.cameraPosition + ray * distance;
        let distanceToBounds = sdSphere(position - bounds.center, bounds.radius);
        
        if (distanceToBounds > 0.1) {
            distance += distanceToBounds;
        } else {
            let step = map(position);
            if (step.distance <= MIN_DISTANCE) {
                color = vec4<f32>(
                    getLight(position, getNormal(position, step.distance), step.color),
                    1.0
                );
                break;
            }
            distance += step.distance;
        }
    }
    #endif
    
    return color;
}

// Vertex Shader
@vertex
fn vertexMain(@location(0) position: vec3<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(position.xy, 0.0, 1.0);
    
    let aspect = camera.resolution.y / camera.resolution.x;
    let uv = vec2<f32>(position.x, position.y * aspect);
    let cameraDistance = (1.0 / tan(camera.cameraFov / 2.0)) * aspect;
    
    let viewMat3 = mat3x3<f32>(
        camera.viewMatrix[0].xyz,
        camera.viewMatrix[1].xyz,
        camera.viewMatrix[2].xyz
    );
    
    output.ray = normalize(vec3<f32>(uv, -cameraDistance) * viewMat3);
    return output;
}


// Fragment Shader
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    var color = march(input.ray);
    
    // sRGB conversion
    var finalColor = vec4<f32>(0.0);
    
    // Linear to sRGB conversion
    for (var i = 0; i < 3; i++) {
        let c = color[i];
        if (c <= 0.0031308) {
            finalColor[i] = 12.92 * c;
        } else {
            finalColor[i] = 1.055 * pow(c, 1.0/2.4) - 0.055;
        }
    }
    finalColor.a = color.a;
    
    // Output color and depth
    let distance = length(camera.cameraPosition + input.ray * camera.cameraNear);
    let z = select(camera.cameraFar, distance * dot(camera.cameraDirection, input.ray), distance >= MAX_DISTANCE);
    let ndcDepth = -((camera.cameraFar + camera.cameraNear) / (camera.cameraNear - camera.cameraFar)) + 
                   ((2.0 * camera.cameraFar * camera.cameraNear) / (camera.cameraNear - camera.cameraFar)) / z;
                   
    // Set fragment depth
    @builtin(frag_depth) var fragmentDepth: f32;
    fragmentDepth = (ndcDepth + 1.0) * 0.5;
    
    return saturate(finalColor);
}