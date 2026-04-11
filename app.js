document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wordForm');
    const tableBody = document.getElementById('wordTableBody');
    const emptyStateRow = document.getElementById('emptyStateRow');
    const wordCountLabel = document.getElementById('wordCountLabel');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');

    // Load words from local storage
    let words = JSON.parse(localStorage.getItem('germanWords')) || [];

    // Initial render
    renderWords();

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const germanWordInput = document.getElementById('germanWord');
        const vietnameseMeaningInput = document.getElementById('vietnameseMeaning');
        const grammarNotesInput = document.getElementById('grammarNotes');

        const newWord = {
            id: Date.now().toString(),
            german: germanWordInput.value.trim(),
            vietnamese: vietnameseMeaningInput.value.trim(),
            grammar: grammarNotesInput.value.trim(),
            createdAt: new Date().toISOString()
        };

        if (newWord.german && newWord.vietnamese) {
            words.unshift(newWord); // Add to beginning
            saveWords();
            renderWords();
            
            // Reset form
            form.reset();
            germanWordInput.focus();
            
            // Show a visual confirmation (optional enhancement)
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Gespeichert!</span> <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
            submitBtn.classList.replace('bg-german-black', 'bg-green-600');
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.replace('bg-green-600', 'bg-german-black');
            }, 1500);

        } else {
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 400);
        }
    });

    // Delete word delegation
    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const idToDelete = deleteBtn.dataset.id;
            words = words.filter(word => word.id !== idToDelete);
            saveWords();
            renderWords();
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        renderWords(searchTerm);
    });

    // Simple Export (JSON)
    exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "german_vocabulary.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    function saveWords() {
        localStorage.setItem('germanWords', JSON.stringify(words));
    }

    function renderWords(filterQuery = '') {
        // Clear current words except empty state
        const rows = document.querySelectorAll('.word-row');
        rows.forEach(row => row.remove());

        const filteredWords = words.filter(word => 
            word.german.toLowerCase().includes(filterQuery) || 
            word.vietnamese.toLowerCase().includes(filterQuery)
        );

        if (filteredWords.length === 0) {
            emptyStateRow.style.display = 'table-row';
            if (filterQuery && words.length > 0) {
                // Not actually empty, just filtering hides all
                 emptyStateRow.querySelector('p').textContent = 'No matching words found.';
            } else {
                 emptyStateRow.querySelector('p').textContent = 'No words added yet.';
            }
            exportBtn.classList.add('hidden');
        } else {
            emptyStateRow.style.display = 'none';
            exportBtn.classList.remove('hidden');

            filteredWords.forEach(word => {
                const tr = document.createElement('tr');
                tr.className = 'word-row group hover:bg-gray-50';
                
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">${escapeHTML(word.german)}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-gray-600">${escapeHTML(word.vietnamese)}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-500 italic">${escapeHTML(word.grammar) || '-'}</div>
                    </td>
                    <td class="px-4 py-4 text-right">
                        <button class="delete-btn text-gray-300 hover:text-german-red transition-colors p-2 rounded opacity-0 group-hover:opacity-100 focus:opacity-100" data-id="${word.id}" aria-label="Delete word">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        wordCountLabel.textContent = `${words.length} word${words.length !== 1 ? 's' : ''} saved`;
    }

    // Utility to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
