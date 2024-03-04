const randomFloat = function(a, b) {
    return Math.random() * (b-a) + a
}

const clone = function(x) {
    return JSON.parse(JSON.stringify(x));
}

class Network {
    // класс нейросети
    constructor(layers) {
        this.layers = layers;
    }

    run(input) {
        // обработка нейросетью данных (на самом деле это просто запуск каждго слоя)
        return this.layers.reduce((acc, item) => item.newRun(acc), input);
    }

    oldRun(input) {
        // обработка нейросетью данных (на самом деле это просто запуск каждго слоя)
        return this.layers.reduce((acc, item) => item.oldRun(acc), input);
    }

    mutate(chance) {
        // мутация весов нейросети с определённым шансом
        this.layers.forEach(function(element) {element.mutate(chance)});
    }

}

class Layer {
    // класс слоя нейросети
    constructor(inputSize, numberNeurons, activation, bias=true, weights) {
        // Функции активации: undefined, "relu", "tanh", "sigmoid"
        this.inputSize = inputSize;
        if (bias) this.inputSize++;
        this.numberNeurons = numberNeurons;
        this.activation = activation;
        this.bias = bias;
        this.gpu = false;
        if (typeof weights === "undefined") {
            this.weights = Array.from({length: this.inputSize*this.numberNeurons}, () => 0);
            this.setRandom();
        } else {
            this.weights = clone(weights);
        }
    }

    setRandom() {
        this.weights = this.weights.map(item => randomFloat(-1, 1));
    }

    newRun(input) {
        // обработать вход слоем нейросети
        const newInput = clone(input);
        if (this.bias) newInput.push(1);

        let result = [];
        if (!this.gpu) {
        let neuronWeights = [];
        let inputNum = 0;
        for (let weightNumber=0;weightNumber<this.weights.length;weightNumber++) {
            inputNum = weightNumber % newInput.length;
            if (inputNum === 0) {
                neuronWeights = [];
            }
            neuronWeights.push(this.weights[weightNumber] * newInput[inputNum]);
            if (inputNum === newInput.length-1) {
                let a = neuronWeights.reduce((sum, value) => sum+value, 0)
                if (this.activation === "relu") a = this.relu(a); // функции активации
                if (this.activation === "tanh") a = this.tanh(a);
                if (this.activation === "sigmoid") a = this.sigmoid(a);
                result.push(a);
            }
        }
        }

        return result;
    }

    oldRun(input) {
        // обработать вход слоем нейросети
        const newInput = clone(input);
        if (this.bias) newInput.push(1);
        const result = [];
        let weightNumber = 0;
        for (let i = 0;i<this.numberNeurons; i++) {
            let a = 0;
            newInput.forEach(element => {
                a += element * this.weights[weightNumber];
                weightNumber++;
            });
            //console.log(a);
            if (this.activation === "relu") a = this.relu(a); // функции активации
            if (this.activation === "tanh") a = this.tanh(a);
            if (this.activation === "sigmoid") a = this.sigmoid(a);
            result.push(a);
        }

        return result;
    }

    mutate(chance) {
        // мутация весов слоя, каждая веса (?) мутирует с шансом от 0 до 1
        this.weights = this.weights.map(element => {
            if (randomFloat(0, 0.99) < chance) {
                return randomFloat(-1, 1);
            } else {
                return element;
            }
        });
    }

    relu(x) {
        if (x < 0) {
            return 0;
        } else {
            return x;
        }
    }

    tanh(x) {
        return Math.tanh(x);
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}