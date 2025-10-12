// Gemini API Service for Image Generation
class GeminiService {
    constructor() {
        this.apiKey = window.CONFIG?.GEMINI_API_KEY || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
    }

    /**
     * Validate API key is configured
     */
    isConfigured() {
        return this.apiKey && this.apiKey.length > 0 && this.apiKey !== 'your-gemini-api-key-here';
    }

    /**
     * Generate customized Cory image based on personality and color
     */
    async generateCoryImage(baseImagePath, coryData) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API 키가 설정되지 않았습니다. config.js 파일을 확인하세요.');
        }

        try {
            // Load base image and convert to base64
            const baseImageBase64 = await this.loadImageAsBase64(baseImagePath);

            // Build prompt with Cory data
            const prompt = this.buildImageGenerationPrompt(coryData);

            console.log('Gemini image generation prompt:', prompt);

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: 'image/png',
                                    data: baseImageBase64
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error:', errorData);
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 Gemini raw response JSON:', JSON.stringify(data, null, 2));
            //console.log('Gemini response:', data);

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('이미지 생성 응답을 받지 못했습니다.');
            }

            // Extract generated image from response
            const candidate = data.candidates[0];
            if (!candidate.content || !candidate.content.parts) {
                throw new Error('생성된 이미지를 찾을 수 없습니다.');
            }

            // Find image part in response - check both inline_data and inlineData
            const imagePart = candidate.content.parts.find(part =>
                part.inline_data || part.inlineData
            );

            if (!imagePart) {
                console.error('Available parts:', candidate.content.parts);
                throw new Error('응답에서 이미지 데이터를 찾을 수 없습니다.');
            }

            // Get image data (support both formats)
            const imageData = imagePart.inline_data || imagePart.inlineData;
            if (!imageData || !imageData.data) {
                console.error('Image part structure:', imagePart);
                throw new Error('이미지 데이터가 비어있습니다.');
            }

            console.log('Found image data, mime type:', imageData.mimeType || imageData.mime_type);

            // Process image to make #FF0000 transparent
            console.log('Processing image to remove background...');
            const mimeType = imageData.mimeType || imageData.mime_type || 'image/png';
            const originalBlob = this.base64ToBlob(imageData.data, mimeType);
            const processedBlob = await this.makeBackgroundTransparent(originalBlob);

            const imageUrl = await this.saveGeneratedImage(processedBlob, coryData.name);

            console.log('Processed image saved:', imageUrl);
            return imageUrl;

        } catch (error) {
            console.error('Gemini image generation error:', error);
            throw error;
        }
    }

    /**
     * Build image generation prompt with Cory data
     */
    buildImageGenerationPrompt(coryData) {
        const personality = coryData.personality;
        const color = coryData.color;
        const story = coryData.story;

        let prompt = `Do not change the overall shape or pose of the gecko in the following image. Modify only its colors and patterns according to the given attributes.
        The background must be completely filled with the solid color exact #FFFFFF (RGB 255, 255, 255). Output the result as a PNG image.\n\n`;

        // Add personality traits
        if (personality && personality.traits) {
            prompt += `Personality: ${personality.traits.join(', ')}\n`;
        }

        // Add personality description
        if (personality && personality.description) {
            prompt += `Description: ${personality.description}\n`;
        }

        // Add key color
        if (color && color.hex) {
            prompt += `Key Color: ${color.hex} (RGB: ${color.r}, ${color.g}, ${color.b})\n`;
        }

        // Add story summary
        if (story && story.summary) {
            prompt += `Background Story: ${story.summary}\n`;
        }

        prompt += `\nRequirements:
        - Keep the gecko’s original shape and pose unchanged.
        - Apply colors and patterns that match its personality traits.
        - No gradients, no textures, no lighting, no vignettes, no compression-like noise
        - Use the given key color as the main color theme.
        - Perfectly flat, solid #FFFFFF (RGB 255, 255, 255) background only.
        - The color #FFFFFF must not be used on the gecko’s body, eyes, shadows, or patterns.
        - Gecko must not contain any color close to #FFFFFF.
        - Output as a PNG image.`;

        return prompt;
    }

    /**
     * Load image file as base64
     */
    async loadImageAsBase64(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const dataURL = canvas.toDataURL('image/png');
                const base64 = dataURL.split(',')[1];
                resolve(base64);
            };

            img.onerror = reject;
            img.src = imagePath;
        });
    }

    /**
     * Convert base64 to blob
     */
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    /**
     * Make #FF0000 background transparent
     */
    async makeBackgroundTransparent(imageBlob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the image
                    ctx.drawImage(img, 0, 0);

                    // Get image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Process pixels to make #EEEEEE transparent
                    let pixelsChanged = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];     // Red
                        const g = data[i + 1]; // Green
                        const b = data[i + 2]; // Blue
                        const a = data[i + 3]; // Alpha

                        // Check if pixel is #EEEEEE (red=238, green=238, blue=238)
                        // Allow small tolerance for compression artifacts
                        if (r >= 238 && g >= 238 && b >= 238) {
                            data[i + 3] = 0; // Set alpha to 0 (transparent)
                            pixelsChanged++;
                        }
                    }

                    console.log(`Made ${pixelsChanged} pixels transparent`);

                    // Put the modified image data back
                    ctx.putImageData(imageData, 0, 0);

                    // Convert canvas to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob from canvas'));
                        }
                    }, 'image/png');

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for processing'));
            };

            // Create object URL from blob and load image
            const imageUrl = URL.createObjectURL(imageBlob);
            img.src = imageUrl;

            // Clean up object URL after processing
            img.onload = (originalOnload => {
                return function() {
                    URL.revokeObjectURL(imageUrl);
                    return originalOnload.apply(this, arguments);
                };
            })(img.onload);
        });
    }

    /**
     * Save generated image and return URL
     */
    async saveGeneratedImage(imageBlob, coryName) {
        // Create object URL for the generated image
        const imageUrl = URL.createObjectURL(imageBlob);

        // Store in a map for later use (this could be enhanced to save to server)
        if (!window.generatedImages) {
            window.generatedImages = new Map();
        }

        const imageId = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Clean up old images if too many exist (prevent memory leaks)
        if (window.generatedImages.size > 10) {
            const oldestKey = window.generatedImages.keys().next().value;
            const oldImage = window.generatedImages.get(oldestKey);
            URL.revokeObjectURL(oldImage.url);
            window.generatedImages.delete(oldestKey);
            console.log('Cleaned up old generated image:', oldestKey);
        }

        window.generatedImages.set(imageId, {
            url: imageUrl,
            blob: imageBlob,
            coryName: coryName,
            createdAt: Date.now(),
            size: imageBlob.size
        });

        console.log(`Generated image stored with ID: ${imageId}, size: ${Math.round(imageBlob.size / 1024)}KB`);
        return imageUrl;
    }


    /**
     * Get image URL (simplified version without IndexedDB)
     */
    async getImageUrl(imageUrl) {
        // For blob URLs and regular URLs, return as-is
        return imageUrl;
    }

    /**
     * Download generated image as file
     */
    downloadGeneratedImage(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename || 'generated-cory.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get default Cory image path
     */
    getDefaultCoryImagePath() {
        return 'assets/images/default_cory.png';
    }

    /**
     * Clean up generated image URLs to prevent memory leaks
     */
    cleanupGeneratedImages() {
        if (window.generatedImages) {
            window.generatedImages.forEach((imageData, id) => {
                URL.revokeObjectURL(imageData.url);
            });
            window.generatedImages.clear();
        }
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.GeminiService = GeminiService;
}