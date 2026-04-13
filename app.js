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
        const exampleSentenceInput = document.getElementById('exampleSentence');

        const newWord = {
            id: Date.now().toString(),
            german: germanWordInput.value.trim(),
            vietnamese: vietnameseMeaningInput.value.trim(),
            grammar: grammarNotesInput.value.trim(),
            example: exampleSentenceInput ? exampleSentenceInput.value.trim() : '',
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

    // Click delegation for table buttons (delete & audio)
    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const idToDelete = deleteBtn.dataset.id;
            words = words.filter(word => word.id !== idToDelete);
            saveWords();
            renderWords();
            return;
        }

        const audioBtn = e.target.closest('.audio-btn');
        if (audioBtn) {
            const wordToSpeak = audioBtn.dataset.word;
            playAudio(wordToSpeak);
        }
    });

    function playAudio(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech so they don't queue up forever
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'de-DE'; // German language
            utterance.rate = 0.9;     // Slightly slower for learning
            utterance.pitch = 1.0;
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text to speech!");
        }
    }

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
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-900">${escapeHTML(word.german)}</span>
                            <button class="audio-btn text-german-red hover:text-red-700 focus:outline-none transition-colors opacity-80 hover:opacity-100" data-word="${escapeHTML(word.german)}" aria-label="Play pronunciation">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-gray-600">${escapeHTML(word.vietnamese)}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-500 italic">${escapeHTML(word.grammar) || '-'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-700">${word.example ? escapeHTML(word.example) : '-'}</div>
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
