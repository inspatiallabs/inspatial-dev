/**
 * # ImageConversionProp
 * #### Configuration options for image conversion and optimization
 *
 * This interface defines the settings for converting and optimizing images, similar to
 * adjusting settings on a digital camera or photo editing app.
 *
 * @since 0.0.9
 * @category InSpatial Util
 * @kind interface
 * @access public
 *
 * ### 📚 Terminology
 * > **Base64**: A way to represent binary data (like images) as text characters, making it easier to send images over the internet or store them in text-based formats.
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface ImageConversionProp {
 *   maxSizeInMB?: number;    // Maximum file size in megabytes
 *   maxWidth?: number;       // Maximum width in pixels
 *   maxHeight?: number;      // Maximum height in pixels
 *   quality?: number;        // Image quality (0 to 1)
 *   allowedTypes?: string[]; // Allowed image formats
 * }
 * ```
 */
interface ImageConversionProp {
  maxSizeInMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowedTypes?: string[];
}

/*##########################################(CREATE IMAGE FROM FILE DOM)##########################################*/
/**
 * # CreateImageFromFileDOM
 * #### Creates an HTMLImageElement from a File object in the browser
 *
 * This function works like a digital photo processor, taking a file and turning it into
 * an image that your web browser can display.
 *
 * @since 0.0.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Converts a File object into an HTMLImageElement
 * - Uses URL.createObjectURL for efficient memory handling
 * - Returns a Promise that resolves when the image loads
 *
 * @param {File} file - Takes a file object, typically from a file input or drag-and-drop
 *
 * @returns {Promise<HTMLImageElement>}
 * Returns a promise that resolves to an HTMLImageElement when the image loads successfully
 *
 * @throws {Error}
 * Throws an error if the image fails to load
 *
 * @example
 * ### Example 1: Loading an Image from a File Input
 * ```typescript
 * // Handling a file input change event
 * const handleFileSelect = async (event: Event) => {
 *   const input = event.target as HTMLInputElement;
 *   if (input.files && input.files[0]) {
 *     try {
 *       const image = await createImageFromFileDOM(input.files[0]);
 *       console.log('Image loaded:', image.width, image.height);
 *     } catch (error) {
 *       console.error('Failed to load image:', error);
 *     }
 *   }
 * };
 * ```
 */
export function createImageFromFileDOM(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/*##########################################(CONVERT IMAGE TO BASE 64 DOM)##########################################*/
/**
 * # ConvertImageToBase64DOM
 * #### Converts and optimizes an image file to a base64 string in the browser
 *
 * Think of this function like a photo optimization tool that can resize, compress,
 * and convert images into a format that's easy to store or send over the internet.
 *
 * @since 0.0.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Validates file type and size
 * - Resizes images if they exceed maximum dimensions
 * - Compresses images while maintaining quality
 * - Converts to base64 format
 *
 * ### ⚠️ Important Notes
 * > [!NOTE]
 * > The function runs in the browser and requires DOM APIs to be available
 *
 * > [!NOTE]
 * > Large images may impact memory usage and performance
 *
 * @param {File} file - The image file to convert
 * @param {ImageConversionProp} options - Configuration options for the conversion
 *
 * @returns {Promise<string>}
 * Returns a promise that resolves to a base64 string representation of the optimized image
 *
 * @throws {Error}
 * - When file type is not supported
 * - When file size exceeds the limit
 * - When canvas context is not available
 * - When conversion fails
 *
 * @example
 * ### Example 1: Basic Image Conversion
 * ```typescript
 * const handleImageConversion = async (file: File) => {
 *   try {
 *     const base64Image = await convertImageToBase64DOM(file);
 *     console.log('Converted image:', base64Image.substring(0, 50) + '...');
 *   } catch (error) {
 *     console.error('Conversion failed:', error);
 *   }
 * };
 * ```
 *
 * @example
 * ### Example 2: Custom Optimization Settings
 * ```typescript
 * const optimizationOptions = {
 *   maxSizeInMB: 2,         // Limit to 2MB
 *   maxWidth: 800,          // Resize to max 800px width
 *   maxHeight: 600,         // Resize to max 600px height
 *   quality: 0.9,           // 90% quality
 *   allowedTypes: ['image/jpeg', 'image/png']  // Only allow JPEG and PNG
 * };
 *
 * const handleOptimizedConversion = async (file: File) => {
 *   try {
 *     const base64Image = await convertImageToBase64DOM(file, optimizationOptions);
 *     // Use the optimized image
 *   } catch (error) {
 *     console.error('Optimization failed:', error);
 *   }
 * };
 * ```
 */
export async function convertImageToBase64DOM(
  file: File,
  options: ImageConversionProp = {}
): Promise<string> {
  const {
    maxSizeInMB = 5,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  } = options;

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Unsupported file type. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  // Validate file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new Error(`File size exceeds ${maxSizeInMB}MB limit`);
  }

  // Create image for dimension checking and potential resizing
  const image = await createImageFromFileDOM(file);

  // Resize if needed
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  let { width, height } = image;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;

  // Draw and compress image
  ctx.drawImage(image, 0, 0, width, height);

  try {
    return canvas.toDataURL(file.type, quality);
  } catch (unknownError) {
    const errorMessage =
      unknownError instanceof Error
        ? unknownError.message
        : "Unknown error occurred";
    throw new Error(`Failed to convert image: ${errorMessage}`);
  }
}
