class Craft {
    constructor(name, imageName, description, supplies) {
        this.name = name;
        this.imageName = imageName;
        this.description = description;
        this.supplies = supplies;
    }

    get image() {
        return `crafts/${this.imageName}`;
    }

    get imageDisplay() {
        return `<img src="${this.image}" alt="${this.name}">`;
    }

    get supplyDisplay() {
        const supplyList = document.createElement('ul');
        this.supplies.forEach(supply => {
            const supplyItem = document.createElement('li');
            supplyItem.textContent = supply;
            supplyList.appendChild(supplyItem);
        });
        return supplyList;
    }


    get modalDisplay() {
        return `
            <div class="modal-content columns">
                <div class="one">${this.imageDisplay}</div>
                <div class="ten">
                    <span class="close">&times;</span>
                    <h2>${this.name}</h2>
                    <p>${this.description}</p>
                    <h3>Supplies:</h3>
                    ${this.supplyDisplay.outerHTML}
                </div>
            </div>
        `;
    }
}

const numColumns = 4;

const getQuarterOfArray = (array, input) => {
    const quarterSize = Math.floor(array.length / numColumns);
    const startIndex = input * quarterSize;
    const endIndex = startIndex + quarterSize;
    const quarter = array.slice(startIndex, endIndex);

    const remainder = array.length % numColumns;
    if (input < numColumns - 1 && remainder !== 0) {
        const remainderArray = array.slice(array.length - remainder);
        if (remainderArray.length > input) {
            quarter.push(remainderArray[input]);
        }
    }
    return quarter;
}

const buildColumns = (crafts) => {
    document.getElementById("crafts").innerHTML = '';
    for (let i = 0; i < numColumns; i++) {
        const section = document.createElement('section');
        section.classList.add('quarter');
        const quarterCrafts = getQuarterOfArray(crafts, i);
        buildColumn(quarterCrafts, section);
        document.getElementById("crafts").appendChild(section);
    }
}

const buildColumn = (quarterCrafts, section) => {
    quarterCrafts.forEach(craft => {
        const article = document.createElement('article');
        article.innerHTML = craft.imageDisplay;
        article.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.classList.add('modal');

            modal.innerHTML = craft.modalDisplay;
            const close = modal.querySelector('.close');
            close.addEventListener('click', () => {
                modal.remove();
            });
            document.body.appendChild(modal);
        });

        section.appendChild(article);
    });
}

getCrafts = () => {
    fetch('/api/crafts')
    .then(response => response.json())
    .then(data => {
        const crafts = [];
        data.forEach(craftJson => {
            const newCraft = new Craft(craftJson.name, craftJson.image, craftJson.description, craftJson.supplies);
            crafts.push(newCraft);
        });
        buildColumns(crafts);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const formModal = document.getElementById('craft-form');
formModal.style.visibility = 'hidden';
document.getElementById('btn-add-craft').addEventListener('click', () => {
    formModal.style.visibility = 'visible';
});

const closeForm = () => {
    formModal.style.visibility = 'hidden';
    document.getElementById('add-craft-form').reset();
    document.getElementById('ul-supplies').innerHTML = 
        `<li><input type="text" name="supplies" minlength="4" required></li>
        <li><input type="text" name="supplies" minlength="4" required></li>`
    ;
    document.getElementById('img-preview').src = 'https://place-hold.it/200x300';
}
document.getElementById('btn-close').addEventListener('click', () => {
    closeForm();
});

document.getElementById('image').addEventListener('change', (event) => {
    if (!event.target.files[0]) {
        return;
    }
    const image = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('img-preview').src = reader.result;
    }
    reader.readAsDataURL(image);
});

formModal.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formInfo = new FormData(event.target);

    const post = await fetch('/api/crafts', {
        method: 'POST',
        body: formInfo,
    });

    if (!post.ok) {
        console.error('Error:', post.status);
        return;
    }
    
    getCrafts();
    closeForm();
});

document.getElementById('btn-add-supply').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'supplies';
    input.required = true;
    input.minLength = 4;

    const li = document.createElement('li');
    li.appendChild(input);

    document.getElementById('ul-supplies').appendChild(li);
});

getCrafts();