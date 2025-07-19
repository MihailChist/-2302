const imagePaths = {
    labubu: 'images/labubu.jpg',
    boll: 'images/boll.jpg',
    konst: 'images/konst.jpg',
    pazz: 'images/pazz.jpg',
};

let toys = [
    { id: 1, name: "Кукла", count: 5, usage: 12, image: imagePaths.labubu},
    { id: 2, name: "Мяч", count: 3, usage: 18, image: imagePaths.boll},
    { id: 3, name: "Конструктор", count: 2, usage: 8, image: imagePaths.konst},
    { id: 4, name: "Пазл", count: 4, usage: 6, image: imagePaths.pazz}
    
];

class ToyAnalyzer {
    constructor() {
        this.learningRate = 0.1;
        this.weights = {
            usage: 0.7,
            count: 0.3
        };
    }

    predictPopularity(toy) {
        const score = (toy.usage * this.weights.usage) - (toy.count * this.weights.count);
        return score;
    }

    train(toys) {
        const mostUsed = toys.reduce((max, toy) => toy.usage > max.usage ? toy : max);
        const leastUsed = toys.reduce((min, toy) => toy.usage < min.usage ? toy : min);
        
        if (mostUsed.count < leastUsed.count) {
            this.weights.usage += this.learningRate;
            this.weights.count -= this.learningRate;
        } else {
            this.weights.usage -= this.learningRate;
            this.weights.count += this.learningRate;
        }
    }
}

const analyzer = new ToyAnalyzer();

function renderToys() {
    const toyList = document.getElementById('toyList');
    toyList.innerHTML = '';
    
    analyzer.train(toys);
    const recommendations = generateRecommendations();
    document.getElementById('recommendation').innerHTML = recommendations;
    
    toys.forEach(toy => {
        const popularityScore = analyzer.predictPopularity(toy);
        const isPopular = popularityScore > 1.5;
        
        const toyElement = document.createElement('div');
        toyElement.className = 'toy-card';
        toyElement.innerHTML = `
            ${isPopular ? '<span class="popular">Популярно!</span>' : ''}
            <div class="toy-image" style="background-image: url('${toy.image}')"></div>
            <div class="toy-name">${toy.name}</div>
            <div class="toy-count">Количество: ${toy.count}</div>
            <div class="toy-usage">Использовано раз: ${toy.usage}</div>
            <div class="controls">
                <button onclick="increaseCount(${toy.id})">+</button>
                <button class="decrease" onclick="decreaseCount(${toy.id})">-</button>
                <button onclick="logUsage(${toy.id})">Использовали</button>
            </div>
        `;
        toyList.appendChild(toyElement);
    });
    
    document.getElementById('neuralStatus').textContent = 
        `Нейросеть проанализировала игрушки. Веса: usage=${analyzer.weights.usage.toFixed(2)}, count=${analyzer.weights.count.toFixed(2)}`;
}

function generateRecommendations() {
    let html = '<h3>Рекомендации нейросети</h3><ul>';
    
    const mostPopular = [...toys].sort((a, b) => 
        analyzer.predictPopularity(b) - analyzer.predictPopularity(a))[0];
    
    const lowestStock = [...toys].sort((a, b) => a.count - b.count)[0];
    
    html += `<li>Самая популярная игрушка: <strong>${mostPopular.name}</strong> (использована ${mostPopular.usage} раз)</li>`;
    html += `<li>Рекомендуем докупить: <strong>${lowestStock.name}</strong> (осталось только ${lowestStock.count})</li>`;
    
    toys.forEach(toy => {
        const ratio = toy.usage / toy.count;
        if (ratio > 3) {
            html += `<li><strong>${toy.name}</strong>: высокий спрос (${ratio.toFixed(1)} использования на 1 игрушку)</li>`;
        }
    });
    
    html += '</ul>';
    return html;
}

function increaseCount(id) {
    const toy = toys.find(t => t.id === id);
    if (toy) {
        toy.count++;
        renderToys();
    }
}

function decreaseCount(id) {
    const toy = toys.find(t => t.id === id);
    if (toy && toy.count > 0) {
        toy.count--;
        renderToys();
    }
}

function logUsage(id) {
    const toy = toys.find(t => t.id === id);
    if (toy) {
        toy.usage++;
        renderToys();
    }
}

document.getElementById('addToyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('toyName').value;
    const count = parseInt(document.getElementById('toyCount').value);
    
    if (name && count > 0) {
        const newToy = {
            id: toys.length > 0 ? Math.max(...toys.map(t => t.id)) + 1 : 1,
            name,
            count,
            usage: 0,
            image: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`
        };
        
        toys.push(newToy);
        renderToys();
        
        this.reset();
    }
});

document.addEventListener('DOMContentLoaded', renderToys);

