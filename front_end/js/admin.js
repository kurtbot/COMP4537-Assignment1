(async () => {
    let result = await fetch('https://kmilan.ca/COMP4537/assignment/1/gold/admin/quizzes', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            if (res.ok) return res.json();
        }).then(res => {
            generateQuizList(res);
        })
})();

function generateQuizList(quizzes) {
    let dom = document.getElementById('quiz-list');

    for (let i = 0; i < quizzes.length; i++) {
        dom.appendChild(QuizButton(quizzes[i]['quiz_id'], quizzes[i]['name']));
    }
}

function QuizButton(quiz_id, name) {
    let quizContainer = document.createElement('div');
    quizContainer.classList.add('quiz-container');
    let quizButton = document.createElement('a');
    quizButton.setAttribute('href', './adminQuiz.html');
    quizButton.classList.add('button-link');
    quizButton.classList.add('btn');
    quizButton.classList.add('btn-primary');
    quizButton.innerText = name;
    quizButton.addEventListener('click', (e) => {
        localStorage.setItem('quiz_id', quiz_id);
        localStorage.setItem('quiz_name', name);
    });
    quizContainer.appendChild(quizButton);
    return quizContainer;
}

function addQuiz() {
    let dom = document.getElementById('quiz-list');
    let name = document.getElementById('inp-add-quiz').value;
    if (name) {
        (async () => { 
            let result = await fetch('https://kmilan.ca/COMP4537/assignment/1/gold/admin/quizzes', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                })
            })
                .then(res => {          
                    if (res.ok) return res.json();
                }).then(res => {
                    dom.appendChild(QuizButton(res['insertId'], name));
                    document.getElementById('inp-add-quiz').value = '';
                })
        })();
    } else {
        document.getElementById('quiz-input-alert').innerText = 'Quiz Title is required';
    }
}

document.getElementById('btn-add-quiz').addEventListener('click', addQuiz);
document.getElementById('inp-add-quiz').addEventListener('change', () => {
    let name = document.getElementById('inp-add-quiz').value;
    if (name) {
        document.getElementById('quiz-input-alert').innerText = '';
    }
});