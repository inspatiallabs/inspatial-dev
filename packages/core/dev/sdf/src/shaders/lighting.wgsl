// WGSL Shader Code
#ifdef ENVMAP_TYPE_CUBE_UV

fn getIBLRadiance(viewDir: vec3<f32>, normal: vec3<f32>, roughness: f32) -> vec3<f32> {
  var reflectVec = reflect(-viewDir, normal);
  reflectVec = normalize(mix(reflectVec, normal, roughness * roughness));
  var envMapColor = textureSample(envMap, reflectVec, roughness);
  return envMapColor.rgb * envMapIntensity;
}

fn getIBLIrradiance(normal: vec3<f32>) -> vec3<f32> {
  var envMapColor = textureSample(envMap, normal, 1.0).rgb;
  return PI * envMapColor * envMapIntensity;
}

fn getLight(position: vec3<f32>, normal: vec3<f32>, diffuse: vec3<f32>) -> vec3<f32> {
  var material: PhysicalMaterial;
  material.diffuseColor = diffuse * (1.0 - metalness);
  material.roughness = max(min(roughness, 1.0), 0.0525);
  material.specularColor = mix(vec3<f32>(0.04), diffuse, metalness);
  material.specularF90 = 1.0;

  var clearCoatNormal: vec3<f32>;
  var clearCoatRadiance: vec3<f32>;
  var viewDir = normalize(cameraPosition - position);

  var radiance = getIBLRadiance(viewDir, normal, material.roughness);
  var irradiance = getIBLIrradiance(normal);

  var reflectedLight: ReflectedLight;
  RE_IndirectDiffuse_Physical(irradiance, position, normal, viewDir, clearCoatNormal, material, reflectedLight);
  RE_IndirectSpecular_Physical(radiance, irradiance, clearCoatRadiance, position, normal, viewDir, clearCoatNormal, material, reflectedLight);

  return reflectedLight.indirectDiffuse + reflectedLight.indirectSpecular;
}

#else

fn getLight(position: vec3<f32>, normal: vec3<f32>, diffuse: vec3<f32>) -> vec3<f32> {
  return diffuse * envMapIntensity;
}

#endif