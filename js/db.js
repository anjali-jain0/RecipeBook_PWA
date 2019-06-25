
db.enablePersistence()
	.catch(err => {
		if(err.code == 'failed-precondition'){
			console.log('persistence failed');
		} elseif(err.code == 'unimplemented'){
			console.log('persistence is not available');
		}
	});

db.collection('recipes').onSnapshot(snapshot => {
	//console.log(snapshot.docChanges());
	snapshot.docChanges().forEach(change => {

		if(change.type === 'added'){
			renderRecipe(change.doc.data() , change.doc.id);
		}

		if(change.type === 'remove'){
			removeRecipe(change.doc.id);
		}
	});

});

const form = document.querySelector('form');
form.addEventListener('submit' , e =>{
	e.preventDefault();

	const recipe = {
		title : form.title.value ,
		ingredients : form.ingredients.value
	};

	db.collection('recipes').add(recipe)
		.catch(err => console.log(err));

    form.title.value = '';
    form.ingredients.value = '';
});

const recipeContainer = document.querySelector('.recipes');

recipeContainer.addEventListener('click' ,e => {
	if(e.target.tagName === 'I'){
		const id = e.target.getAttribute('data-id');
		db.collection('recipes').doc(id).delete();
	}
});