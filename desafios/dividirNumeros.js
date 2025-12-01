function dividirNumeros(number1, number2) { 
    try
    {   
        if (number2 === 0)
    {
        throw new Error("Divisão por zero não é permitida.");
    }

    return number1 / number2;

    }
    catch (error)
    {
        return "Erro: " + error.message;
    }
}
