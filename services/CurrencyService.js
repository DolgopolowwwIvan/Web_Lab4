class CurrencyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://v6.exchangerate-api.com/v6';
    }

    async convert(amount, fromCurrency, toCurrency) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result !== 'success') {
                throw new Error(`API error: ${data['error-type'] || 'Unknown error'}`);
            }
            
            const convertedAmount = data.conversion_result.toFixed(2);
            const rate = data.conversion_rate.toFixed(4);
            
            return {
                amount: convertedAmount,
                rate: rate,
                date: new Date().toLocaleDateString('ru-RU')
            };
        } catch (error) {
            throw new Error(`Ошибка конвертации: ${error.message}`);
        }
    }
}

module.exports = CurrencyService;