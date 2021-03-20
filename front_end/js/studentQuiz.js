const urlSite = 'https://kmilan.ca/COMP4537/assignment/1/gold';

// helper functions

function createElement(type) {
    return document.createElement(type);
}

function getElementById(id) {
    return document.getElementById(id);
}

// function objects

function Quiz(quiz_id, name) {
    this.quiz_id = quiz_id;
    this.name = name;
    this.questions = [];
    this.questionList = null;
    let answers = [];

    let choiceJsonToArray = (choices) => {
        let choiceArr = [];
        for (let i = 0; i < choices.length; i++) {
            choiceArr[i] = new Choice(choices[i]['choice'], choices[i]['choice_id'], choices[i]['answer'] == 1 || choices[i]['answer'] == true);
        }
        return choiceArr;
    }

    this.checkAnswers = () => {
        let score = 0;
        let total = 0;
        for(let i = 0; i < this.questions.length; i++)
        {
            if (this.questions[i].checkAnswer()) 
                score++;
            total ++;
        }
        getElementById('submit-data').innerText = `Score: ${score} / ${total}`
    }

    this.load = () => {
        return new Promise((resolve, reject) => {
            (async () => {
                let result = await fetch(`${urlSite}/student/quizzes/questions?quiz_id=${quiz_id}`, {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json' },
                }).then((res) => {
                    if (res.ok) return res.json();
                }).then((res) => {
                    if (res != null)
                        for (let i = 0; i < res.length; i++) {
                            let choiceData = choiceJsonToArray(res[i].choices);
                            this.questions.push(new Question(res[i].question, res[i].question_id, choiceData, this, i));
                            answers[i] = res[i].answer;
                        }
                    resolve();
                })
            })();
        });
    }

    this.renderTake = (locId = null) => {
        let dom = (locId) ? getElementById(locId) : createElement('div');
        this.questionList = dom;
        if (this.questions.length > 0) {
            for (let i = 0; i < this.questions.length; i++) {
                dom.appendChild(this.questions[i].renderTake(true, false));
            }
            let submitButton = createElement('button');
            submitButton.innerText = 'Submit';
            submitButton.id = 'submit-btn';
            submitButton.classList.add('button-link');
            submitButton.classList.add('btn');
            submitButton.classList.add('btn-primary');
            submitButton.style.marginTop = '3%';
            submitButton.addEventListener('click', () => { this.checkAnswers(); });
            dom.appendChild(submitButton);
        }
        else {
            dom.innerText = 'There are currently no questions';
        }
        return dom;
    }
}

function Question(question, question_id, choices, quiz, index) {
    this.question_id = question_id;
    this.question = question;
    this.quiz = quiz;
    this.index = index;
    this.choices = choices;
    let elements = {};

    if (choices == null) {
        this.choices = [];
        for (let i = 0; i < 2; i++) {
            let newChoice = new Choice('', null, false, this, this.numChoices++);
            this.choices.push(newChoice);
        }
    } else {
        this.choices = [];
        for (let i = 0; i < choices.length; i++) {
            this.choices[i] = new Choice(choices[i].choice, choices[i].choice_id, choices[i].answer, this , this.numChoices++);
        }
    }

    this.checkAnswer = () => {
        let correctAnswer = false;
        for(let i = 0; i < this.choices.length; i++)
        {
            if(this.choices[i].checkAnswer())
            {
                correctAnswer = true;
            }
        }
        return correctAnswer;
    }

    this.renderTake = (locId = null, container = null) => {
        // question form
        let dom = createElement('div');

        let questionNumber = createElement('div');
        questionNumber.innerText = (this.index + 1) + `.`;
        questionNumber.style.float = 'left';
        questionNumber.style.marginRight = '10px';
        dom.appendChild(questionNumber);

        let quizTitleInput = createElement('div');
        elements['quizTitleInput'] = quizTitleInput;
        quizTitleInput.setAttribute('type', 'text');
        quizTitleInput.setAttribute('required', 'true');
        quizTitleInput.innerText = this.question;
        dom.appendChild(quizTitleInput);

        let choiceDiv = createElement('div');
        choiceDiv.id = 'choiceDiv';
        for (let i = 0; i < this.choices.length; i++) {
            choiceDiv.appendChild(this.choices[i].renderTake());
        }

        dom.appendChild(choiceDiv);

        return dom;
    }
}

function Choice(choice, choice_id, answer, question) {
    this.choice_id = choice_id;
    this.choice = choice;
    this.answer = answer;
    this.question = question;
    let elements = {};

    this.checkAnswer = () => {
        if(elements['radBtn'].checked && this.answer)
        {
            return true;
        }
    }

    this.renderTake = () => {
        let dom = createElement('div');

        let radBtn = createElement('input');
        elements['radBtn'] = radBtn;
        radBtn.setAttribute('type', 'radio');
        radBtn.setAttribute('required', 'true');
        if (this.question['question_id'] != null)
            radBtn.setAttribute('name', this.question.question_id);
        dom.appendChild(radBtn);

        let editChoiceInput = createElement('label');
        elements['editChoiceInput'] = editChoiceInput;
        editChoiceInput.setAttribute('type', 'text');
        editChoiceInput.setAttribute('required', 'true');
        editChoiceInput.innerText = choice;
        dom.appendChild(editChoiceInput);

        return dom;
    }
}