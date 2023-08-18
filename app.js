function removeDiacritics(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
function removeNaNFromText(text) {
    return text.replace(/ \(NaN\)/g, '');
}
function removeDuplicateSanctions(text) {
    // Buscar patrones como ": 350 €: 350 €" y reemplazarlos por ": 350 €"
    return text.replace(/: (\d+ ?€): \1/g, ': $1');
}

function filterArticles(query) {
    const listItems = document.querySelectorAll('#articlesList li');
    const normalizedQuery = removeDiacritics(query.toLowerCase());

    listItems.forEach(item => {
        const articleDesc = item.textContent;
        const normalizedDesc = removeDiacritics(articleDesc.toLowerCase());

        if (normalizedDesc.includes(normalizedQuery)) {
            item.style.display = ''; // mostrar elemento
        } else {
            item.style.display = 'none'; // esconder elemento
        }
    });
}



document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value;
    filterArticles(query);
});
document.getElementById('goToCommand').addEventListener('click', function() {
    window.scrollTo(0,document.body.scrollHeight);
});
document.getElementById('copyButton').addEventListener('click', function() {
    const textarea = document.getElementById('command');
    textarea.select();
    document.execCommand('copy');
});
const promptsShown = new Set();
function getSanctionValue(item) {
    const sanctionText = item.getAttribute('data-sancion');
    const itemId = item.id; // Suponiendo que cada artículo tiene un id único
    let sanctionValue = 0;

    if (sanctionText.includes("X Kg") && !promptsShown.has(itemId)) {
        let baseSanction = parseFloat(sanctionText.split("€")[0].trim());
        let kg = parseFloat(prompt("¿Cuántos Kg?", "1"));
        sanctionValue = baseSanction * (isNaN(kg) ? 1 : kg);
        promptsShown.add(itemId); // Añadimos el artículo al registro
    } else if (sanctionText.includes("€ (por cada persona)") && !promptsShown.has(itemId)) {
        let baseSanction = parseFloat(sanctionText.split("€")[0].trim());
        let people = parseFloat(prompt("¿Cuántas personas?", "1"));
        sanctionValue = baseSanction * (isNaN(people) ? 1 : people);
        promptsShown.add(itemId); // Añadimos el artículo al registro
    } else if (sanctionText.includes("€ (por cada menor)") && !promptsShown.has(itemId)) {
        let baseSanction = parseFloat(sanctionText.split("€")[0].trim());
        let minors = parseFloat(prompt("¿Cuántos menores?", "1"));
        sanctionValue = baseSanction * (isNaN(minors) ? 1 : minors);
        promptsShown.add(itemId); // Añadimos el artículo al registro
    } else {
        sanctionValue = parseFloat(sanctionText.split("€")[0].trim());
    }

    // Esta parte asegura que no regresemos un NaN
    return isNaN(sanctionValue) ? 0 : sanctionValue;
}




function getSanctionTotal() {
    let totalSanction = 0;
    const selectedItems = document.querySelectorAll('li.bg-white');

    selectedItems.forEach(item => {
        const value = getSanctionValue(item);
        if (value !== null) {
            totalSanction += value;
        }
    });

    return totalSanction;
}

function updateCommand() {
    const commandElem = document.getElementById('command');
    let selectedItems = Array.from(document.querySelectorAll('li.bg-white'));
    
    // Ordenar alfabéticamente los elementos seleccionados por su innerText
    selectedItems.sort((a, b) => a.innerText.trim().localeCompare(b.innerText.trim()));

    let totalSanction = 0;
    let commandText = "?warn";

    selectedItems.forEach(item => {
        const sanctionValue = getSanctionValue(item);
        totalSanction += sanctionValue;

        // Detección y modificación de los artículos especiales
        let modifiedText = item.innerText.trim();
        if (item.innerText.includes('Tráfico de drogas') || 
            item.innerText.includes('Posesión de estupefacientes') || 
            item.innerText.includes('Tráfico de personas') || 
            item.innerText.includes('Tráfico de menores')) {
            
            modifiedText = `${modifiedText} (${sanctionValue} €)`;
        }

        // Si el artículo tiene sanción duplicada, solo muestra una vez
        const splitText = modifiedText.split(':');
        if (splitText.length > 2) {
            commandText += `\n${splitText[0]}: ${sanctionValue} €`;
        } else {
            commandText += `\n${modifiedText}`;
        }
    });

    commandText = `?warn\nTotal: ${totalSanction} €` + commandText.substr(5); // Poner el total arriba
    commandElem.textContent = commandText;
}




document.addEventListener('DOMContentLoaded', function() {
    const listItems = document.querySelectorAll('li');

    listItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('bg-white')) {
                e.target.classList.remove('bg-white');
            } else {
                e.target.classList.add('bg-white');
            }

            updateCommand();
        });
    });
});

