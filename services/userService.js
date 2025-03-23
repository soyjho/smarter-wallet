// Validação de e-mail
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { errorMessage: 'Email inválido.' };
    }

    return { fieldFormatted: email.toLowerCase() };
};

// Validação de nome
export const validateFullName = (name) => {
    function formatName(input) {
        const interjections = ['de', 'do', 'dos', 'da', 'das'];
        let cleanedInput = input.replace(/[^\p{L}\s]/gu, '').trim().toLowerCase();
        let nameParts = cleanedInput.split(/\s+/);

        let formattedNames = nameParts.map(part => {
            if (interjections.includes(part.toLowerCase())) {
                return part.toLowerCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
        });
        return formattedNames.join(' ');
    }

    if (typeof name !== 'string') {
        return { errorMessage: 'Nome completo deve ser uma string.' }
    }
    if (name.length < 3 || name.length > 200) {
        return { errorMessage: 'Deve ter entre 3 e 200 caracteres.' }
    }
    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(name)) {
        return { errorMessage: 'Deve conter apenas letras e espaços.' }
    }
    const spaceRegex = /\s+/;
    if (!spaceRegex.test(name.trim())) {
        return { errorMessage: 'Deve ser informado o nome completo.' }
    }
    return { fieldFormatted: formatName(name) }
};