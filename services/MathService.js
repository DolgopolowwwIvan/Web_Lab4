class MathService {
    calculate(expression) {
        try {
            let cleanExpression = expression.replace(/\s/g, '');
            
            cleanExpression = cleanExpression.replace(/\^/g, '**');
            
            cleanExpression = cleanExpression.replace(/sin\(/g, 'Math.sin(');
            cleanExpression = cleanExpression.replace(/cos\(/g, 'Math.cos(');
            cleanExpression = cleanExpression.replace(/tan\(/g, 'Math.tan(');
            cleanExpression = cleanExpression.replace(/sqrt\(/g, 'Math.sqrt(');
            cleanExpression = cleanExpression.replace(/log\(/g, 'Math.log(');
            cleanExpression = cleanExpression.replace(/pi/g, 'Math.PI');
            
            const calculate = new Function('return ' + cleanExpression);
            const result = calculate();
            
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('Некорректный результат');
            }
            
            return Math.round(result * 1000000) / 1000000;
        } catch (error) {
            throw new Error('Ошибка в выражении');
        }
    }

    isMathExpression(text) {
        const mathRegex = /^[0-9+\-*/().\s^a-z]+$/;
        return text && mathRegex.test(text.toLowerCase());
    }
}

module.exports = MathService;