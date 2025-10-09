// Pocket/Collection Management System
class PocketManager {
    constructor(app) {
        this.app = app;
    }

    renderPocketGrid() {
        const pocketGrid = document.getElementById('pocketGrid');
        if (!pocketGrid) return;

        pocketGrid.innerHTML = '';

        const allCorys = this.app.account.getAllCorys();

        // Create rows (3 cards per row)
        const cardsPerRow = 3;
        const rows = Math.ceil(allCorys.length / cardsPerRow);
        const maxRows = Math.max(rows, 3); // Minimum 3 rows

        for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
            const row = document.createElement('div');
            row.className = 'pocket-row';

            for (let cardIndex = 0; cardIndex < cardsPerRow; cardIndex++) {
                const coryIndex = rowIndex * cardsPerRow + cardIndex;
                const cory = allCorys[coryIndex];

                const card = document.createElement('div');
                card.className = 'cory-card';

                if (cory) {
                    // Filled card
                    card.innerHTML = `
                        <img src="${cory.imageUrl}" alt="${cory.name}" class="cory-card-image">
                        <div class="cory-card-name">${cory.name}</div>
                    `;
                    card.dataset.coryId = cory.id;
                    card.addEventListener('click', () => this.handleCoryCardClick(cory));
                } else {
                    // Empty card
                    card.classList.add('empty');
                    card.innerHTML = `
                        <div class="empty-text">Empty<br>Slot</div>
                    `;
                }

                row.appendChild(card);
            }

            pocketGrid.appendChild(row);
        }
    }

    handleCoryCardClick(cory) {
        if (cory.isRepresentative) {
            this.app.showToast('이미 대표 코리로 설정되어 있습니다.');
            return;
        }

        this.app.dialogManager.showRepresentativeDialog(cory);
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.PocketManager = PocketManager;
}
