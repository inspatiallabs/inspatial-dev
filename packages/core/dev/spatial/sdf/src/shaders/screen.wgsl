struct ScreenVertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@group(0) @binding(0) var colorSampler: sampler;
@group(0) @binding(1) var colorTexture: texture_2d<f32>;
@group(0) @binding(2) var depthSampler: sampler;
@group(0) @binding(3) var depthTexture: texture_2d<f32>;

@vertex
fn vertexMain(@location(0) position: vec3<f32>) -> ScreenVertexOutput {
    var output: ScreenVertexOutput;
    output.position = vec4<f32>(position.xy, 0.0, 1.0);
    output.uv = position.xy * 0.5 + 0.5;
    return output;
}

@fragment
fn fragmentMain(input: ScreenVertexOutput) -> @location(0) vec4<f32> {
    let color = textureSample(colorTexture, colorSampler, input.uv);
    
    @builtin(frag_depth) var fragmentDepth: f32;
    fragmentDepth = textureSample(depthTexture, depthSampler, input.uv).r;
    
    return color;
}