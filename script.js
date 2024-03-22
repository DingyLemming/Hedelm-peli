document.addEventListener('DOMContentLoaded', function() {
    const reels = document.querySelectorAll('.reel');
    const playButton = document.getElementById('play-button');
    const betInput = document.getElementById('bet');
    const moneyDisplay = document.getElementById('money-amount');
    const messageDisplay = document.getElementById('message');
    const locks = document.querySelectorAll('.lock');

    let money = 100;
    let bet = 0;
    let lockedSymbols = {};
    let locksOnCooldown = true;
    let locksUsedLastRound = false;

    playButton.addEventListener('click', playRound);

    locks.forEach(lock => {
        lock.addEventListener('click', () => toggleLock(lock));
    });

    function playRound() {
        if (betInput.value === '' || isNaN(betInput.value) || parseInt(betInput.value) <= 0) {
            messageDisplay.textContent = 'Syötä kelvollinen panos.';
            return;
        }
    
        bet = parseInt(betInput.value);
        if (bet > money) {
            messageDisplay.textContent = 'Sinulla ei ole tarpeeksi rahaa.';
            return;
        }
    
        money -= bet;
        moneyDisplay.textContent = money;
    
        // Spin only unlocked reels
        reels.forEach((reel, index) => {
            if (!reel.classList.contains('locked')) {
                const symbol = getRandomSymbol();
                reel.innerHTML = `<img src="images/${symbol}.png" alt="${symbol}">`;
                reel.dataset.symbol = symbol;
            }
        });
    
        // Reset locked symbols
        lockedSymbols = {};
    
        // Reset lock buttons and update lock images
        locks.forEach(lock => {
            const reelIndex = lock.dataset.reel;
            const reel = document.getElementById(`symbol${reelIndex}`);
            const lockImg = lock.querySelector('img');
    
            lock.classList.remove('locked'); // Unlock the lock
            reel.classList.remove('locked'); // Unlock the reel
    
            if (lock.classList.contains('locked')) {
                lockImg.src = 'images/lock-closed.png'; // Change lock image to closed
            } else {
                lockImg.src = 'images/lock-open.png'; // Change lock image to open
            }
        });
    
        // Check if locks were used in the previous round
        if (locksUsedLastRound) {
            locksOnCooldown = true;
        } else {
            locksOnCooldown = false;
        }
    
        locksUsedLastRound = false; // Reset for the next round
    
        checkWin();
    }    

    function toggleLock(lock) {
        const reelIndex = lock.dataset.reel;
        const reel = document.getElementById(`symbol${reelIndex}`);
        
        if (locksOnCooldown) {
            messageDisplay.textContent = 'Lukot ovat jäähdytystilassa.';
            return;
        }
    
        // Vaihda lukon tila
        lock.classList.toggle('locked');
    
        // Vaihda rullan tila
        reel.classList.toggle('locked');
    
        // Päivitä lukon kuvaa sen tilan perusteella
        const lockImg = lock.querySelector('img');
        if (lock.classList.contains('locked')) {
            lockImg.src = 'images/lock-closed.png'; // Vaihda lukon kuva kiinni-kuvaan
        } else {
            lockImg.src = 'images/lock-open.png'; // Vaihda lukon kuva avoinna-kuvaan
        }
    
        // Päivitä lukon tilan seurantamuuttujat
        if (lock.classList.contains('locked')) {
            lockedSymbols[reelIndex] = true;
            locksUsedLastRound = true;
        } else {
            delete lockedSymbols[reelIndex];
        }
    }    

    function getRandomSymbol() {
        const symbols = ['apple', 'pear', 'cherry', 'watermelon', '7'];
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function checkWin() {
        const symbols = [];
        reels.forEach(reel => {
            const img = reel.querySelector('img');
            symbols.push(img.alt);
        });

        const symbolCounts = {};
        symbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });

        console.log('Symbol counts:', symbolCounts);
        let winMultiplier = 0;

        if (symbolCounts['7'] === 4) {
            winMultiplier = 10;
        } else if (symbolCounts['7'] === 3) {
            winMultiplier = 5;
        } else {
            for (const symbol in symbolCounts) {
                if (symbolCounts[symbol] === 4) {
                    winMultiplier = getMultiplierForSymbol(symbol);
                }
            }
        }

        if (winMultiplier > 0) {
            money += bet * winMultiplier;
            moneyDisplay.textContent = money;
            messageDisplay.textContent = `Voitit ${bet * winMultiplier} €!`; // Voitit [voitto] €!
        } else {
            messageDisplay.textContent = 'Ei voittoa.'; // Ei voittoa.
        }
    }

    function getMultiplierForSymbol(symbol) {
        switch (symbol) {
            case 'apple':
                return 6;
            case 'watermelon':
                return 5;
            case 'pear':
                return 4;
            case 'cherry':
                return 3;
            default:
                return 0;
        }
    }
});
