// Cory Model Class
class Cory {
    constructor(data = {}) {
        // Required basic properties
        this.id = data.id || `cory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name || 'Unnamed Cory';

        // Visual properties
        this.imageUrl = data.imageUrl || 'assets/images/default_cory.png';
        this.designFile = data.designFile || data.imageUrl || 'assets/images/default_cory.png';

        // Color data (RGB format)
        this.color = data.color || {
            r: 228,
            g: 149,
            b: 164,
            hex: '#E495A4'
        };

        // Personality traits
        this.personality = data.personality || {
            traits: ['친근한', '호기심 많은'],
            description: '기본 성격입니다.'
        };

        // Story and background
        this.story = data.story || {
            summary: '새로운 코리입니다.',
            lines: ['안녕하세요!', '저는 새로운 코리예요.']
        };

        // Metadata
        this.createdAt = data.createdAt || Date.now();
        this.isRepresentative = data.isRepresentative || false;
        this.sourcePhoto = data.sourcePhoto || null;
    }

    /**
     * Create Cory from AI-generated data
     */
    static fromAIData(aiData, sourcePhoto = null) {
        return new Cory({
            name: aiData.name,
            color: aiData.color,
            personality: aiData.personality,
            story: aiData.story,
            sourcePhoto: sourcePhoto,
            createdAt: Date.now()
        });
    }

    /**
     * Update Cory with new data
     */
    update(data) {
        Object.keys(data).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                this[key] = data[key];
            }
        });
    }

    /**
     * Get Cory as plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            designFile: this.designFile,
            color: this.color,
            personality: this.personality,
            story: this.story,
            createdAt: this.createdAt,
            isRepresentative: this.isRepresentative,
            sourcePhoto: this.sourcePhoto
        };
    }

    /**
     * Validate Cory data structure
     */
    isValid() {
        return this.id &&
               this.name &&
               this.color &&
               this.personality &&
               this.story &&
               this.createdAt;
    }

    /**
     * Get display name with fallback
     */
    getDisplayName() {
        return this.name || 'Unnamed Cory';
    }

    /**
     * Get primary color as hex string
     */
    getPrimaryColor() {
        return this.color?.hex || '#E495A4';
    }

    /**
     * Get personality traits as string
     */
    getPersonalityString() {
        return this.personality?.traits?.join(', ') || '친근한';
    }

    /**
     * Get story summary
     */
    getStorySummary() {
        return this.story?.summary || '새로운 코리입니다.';
    }

    /**
     * Get story lines array
     */
    getStoryLines() {
        return this.story?.lines || ['안녕하세요!'];
    }

    /**
     * Set as representative
     */
    setAsRepresentative(isRepresentative = true) {
        this.isRepresentative = isRepresentative;
    }

    /**
     * Clone Cory instance
     */
    clone() {
        return new Cory(this.toJSON());
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.Cory = Cory;
}