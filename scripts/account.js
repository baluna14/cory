// Account Management System
class Account {
    constructor(accountId = '1234567890') {
        this.accountId = accountId;
        this.playTime = 0; // Total play time in minutes
        this.sessionStartTime = Date.now(); // Current session start time
        this.coryCollection = []; // Array of collected Cory objects
        this.representativeCoryId = null; // ID of the representative Cory
        this.createdAt = Date.now();
        this.lastLogin = Date.now();

        // Load from localStorage if exists
        this.loadFromStorage();
    }

    // Save account data to localStorage
    saveToStorage() {
        const accountData = {
            accountId: this.accountId,
            playTime: this.getTotalPlayTime(),
            coryCollection: this.coryCollection.map(cory =>
                cory instanceof Cory ? cory.toJSON() : cory
            ),
            representativeCoryId: this.representativeCoryId,
            createdAt: this.createdAt,
            lastLogin: Date.now()
        };

        localStorage.setItem('cory_account', JSON.stringify(accountData));
        console.log('Account data saved to localStorage');
    }

    // Load account data from localStorage
    loadFromStorage() {
        const savedData = localStorage.getItem('cory_account');

        if (savedData) {
            try {
                const accountData = JSON.parse(savedData);

                // Only load if account ID matches
                if (accountData.accountId === this.accountId) {
                    this.playTime = accountData.playTime || 0;

                    // Convert plain objects to Cory instances
                    this.coryCollection = (accountData.coryCollection || []).map(coryData =>
                        coryData instanceof Cory ? coryData : new Cory(coryData)
                    );

                    this.representativeCoryId = accountData.representativeCoryId || null;
                    this.createdAt = accountData.createdAt || Date.now();
                    this.lastLogin = accountData.lastLogin || Date.now();

                    console.log('Account data loaded from localStorage');
                    return true;
                }
            } catch (error) {
                console.error('Error loading account data:', error);
            }
        }

        console.log('No saved account data found, using defaults');
        return false;
    }

    // Calculate total play time including current session
    getTotalPlayTime() {
        const currentSessionTime = Math.floor((Date.now() - this.sessionStartTime) / 60000);
        return this.playTime + currentSessionTime;
    }

    // Update play time before saving
    updatePlayTime() {
        this.playTime = this.getTotalPlayTime();
        this.sessionStartTime = Date.now();
    }

    // Normalize Cory object to ensure all required properties exist
    normalizeCory(cory) {
        // If already a Cory instance, return as is
        if (cory instanceof Cory) {
            return cory;
        }

        // Create new Cory instance from plain object
        return new Cory(cory);
    }

    // Add a Cory to the collection
    addCory(cory) {
        // Normalize Cory object to ensure all properties exist
        const normalizedCory = this.normalizeCory(cory);

        // Check if Cory already exists
        const existingIndex = this.coryCollection.findIndex(c => c.id === normalizedCory.id);

        if (existingIndex >= 0) {
            // Update existing Cory
            this.coryCollection[existingIndex] = normalizedCory;
            console.log(`Updated existing Cory: ${normalizedCory.name}`);
        } else {
            // Add new Cory
            this.coryCollection.push(normalizedCory);
            console.log(`Added new Cory: ${normalizedCory.name}`);
        }

        // If this is the first Cory and no representative is set, make it representative
        if (this.coryCollection.length === 1 && !this.representativeCoryId) {
            this.setRepresentativeCory(normalizedCory.id);
        }

        this.saveToStorage();
        return normalizedCory;
    }

    // Remove a Cory from the collection
    removeCory(coryId) {
        const index = this.coryCollection.findIndex(c => c.id === coryId);

        if (index >= 0) {
            const removed = this.coryCollection.splice(index, 1)[0];

            // If removed Cory was representative, set a new one
            if (this.representativeCoryId === coryId && this.coryCollection.length > 0) {
                this.setRepresentativeCory(this.coryCollection[0].id);
            } else if (this.coryCollection.length === 0) {
                this.representativeCoryId = null;
            }

            this.saveToStorage();
            console.log(`Removed Cory: ${removed.name}`);
            return removed;
        }

        return null;
    }

    // Get a Cory by ID
    getCory(coryId) {
        return this.coryCollection.find(c => c.id === coryId);
    }

    // Get all Corys
    getAllCorys() {
        return [...this.coryCollection];
    }

    // Get Cory count
    getCoryCount() {
        return this.coryCollection.length;
    }

    // Set representative Cory
    setRepresentativeCory(coryId) {
        const cory = this.getCory(coryId);

        if (cory) {
            // Remove representative flag from previous representative
            if (this.representativeCoryId) {
                const prevRepresentative = this.getCory(this.representativeCoryId);
                if (prevRepresentative) {
                    prevRepresentative.isRepresentative = false;
                }
            }

            // Set new representative
            this.representativeCoryId = coryId;
            cory.isRepresentative = true;

            this.saveToStorage();
            console.log(`Set representative Cory: ${cory.name}`);
            return cory;
        }

        return null;
    }

    // Get representative Cory
    getRepresentativeCory() {
        if (this.representativeCoryId) {
            return this.getCory(this.representativeCoryId);
        }

        // If no representative set but have Corys, return first one
        if (this.coryCollection.length > 0) {
            return this.coryCollection[0];
        }

        return null;
    }

    // Get account summary
    getAccountSummary() {
        return {
            accountId: this.accountId,
            playTime: this.getTotalPlayTime(),
            coryCount: this.getCoryCount(),
            representativeCory: this.getRepresentativeCory(),
            createdAt: this.createdAt,
            lastLogin: this.lastLogin
        };
    }

    // Clear all data (for testing/reset)
    clearData() {
        this.playTime = 0;
        this.sessionStartTime = Date.now();
        this.coryCollection = [];
        this.representativeCoryId = null;
        this.createdAt = Date.now();
        this.lastLogin = Date.now();

        localStorage.removeItem('cory_account');
        console.log('Account data cleared');
    }

    // Auto-save on page unload
    setupAutoSave() {
        window.addEventListener('beforeunload', () => {
            this.updatePlayTime();
            this.saveToStorage();
        });

        // Auto-save every 30 seconds
        setInterval(() => {
            this.updatePlayTime();
            this.saveToStorage();
        }, 30000);
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.Account = Account;
}
