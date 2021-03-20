const urlSite = 'https://kmilan.ca/COMP4537/assignment/1/gold';

// helper functions

function createElement(type) {
    return document.createElement(type);
}

function getElementById(id) {
    return document.getElementById(id);
}

function questionAdd(quiz, question, question_id, choices) {
    quiz.addQuestion(question, question_id, choices, quiz);
}

// function object

function Quiz(quiz_id, name) {
    this.quiz_id = quiz_id;
    this.name = name;
    this.questions = [];
    this.questionList = null;

    let choiceJsonToArray = (choices) => {
        let choiceArr = [];
        for (let i = 0; i < choices.length; i++) {
            choiceArr[i] = new Choice(choices[i]['choice'], choices[i]['choice_id'], choices[i]['answer'] == 1 || choices[i]['answer'] == true);
        }
        return choiceArr;
    }

    this.load = () => {
        return new Promise((resolve, reject) => {
            (async () => {
                let result = await fetch(`${urlSite}/admin/quizzes/questions?quiz_id=${quiz_id}`, {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json' },
                }).then((res) => {
                    if (res.ok) return res.json();
                }).then((res) => {
                    if (res != null)
                        for (let i = 0; i < res.length; i++) {
                            let choiceData = choiceJsonToArray(res[i].choices);
                            this.questions.push(new Question(res[i].question, res[i].question_id, choiceData, this));
                        }
                    resolve();
                })
            })();
        });
    }

    this.renderEdit = (locId = null) => {
        // question form
        let dom = (locId != null) ? getElementById(locId) : createElement('div');
        dom.appendChild(new Question('', -1, null, this).renderEdit(false, true));
    }

    this.renderUpdate = (locId = null) => {
        // updatable question form, no add question
        let dom = (locId) ? getElementById(locId) : createElement('div');
        this.questionList = dom;

        for (let i = 0; i < this.questions.length; i++) {
            dom.appendChild(this.questions[i].renderEdit(true, false));
        }
    }

    this.addQuestion = (question, question_id, choices) => {
        let newQuestion = new Question(question, question_id, choices, this);
        this.questions.push(newQuestion);
        this.questionList.appendChild(newQuestion.renderEdit(true, false));
    }
}

function Question(question, question_id = null, choices, quiz) {
    this.question = question;
    this.question_id = question_id;
    this.numChoices = 0;
    this.quiz = quiz;
    this.choices;
    let choiceList = null;
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
            this.choices[i] = new Choice(choices[i].choice, choices[i].choice_id, (choices[i].isAnswer != 0 && choices[i].isAnswer != false), this, this.numChoices++);
        }
    }

    this.clearQuestion = () => {
        elements['quizTitleInput'].value = '';
        for (let i = 0; i < this.choices.length; i++) {
            this.choices[i].clearChoice();
        }
    }

    this.getJson = () => {
        let data = {};
        data['question'] = elements['quizTitleInput'].value;

        if (this.question_id)
            data['question_id'] = this.question_id;

        data['quiz_id'] = quiz_id;
        data['choices'] = [];

        for (let i = 0; i < this.choices.length; i++) {
            data['choices'][i] = this.choices[i].getJson();
        }

        return data;
    }

    this.hasRequirements = () => {
        if(elements['quizTitleInput'].value == null)
            return false;
        let hasAnswer = false;
        for(let i = 0; i < this.choices.length; i++)
        {
            if(!this.choices[i].hasRequirements())
                return false;  
            if(this.choices[i].radHasRequirement())
                hasAnswer = true;
        }
        return hasAnswer;
    }

    this.checkChoice = () => {
        for (let i = 0; i < this.choices.length; i++) {
            if (this.choices[i].isAnswer === true) {
                this.choices[i].setCheckRadio(true);
            }
        }
    }

    this.showRemove = () => {
        this.choices.forEach(elem => {
            elem.setRemoveView(true);
        });
    }

    this.hideRemove = () => {
        this.choices.forEach(elem => {
            elem.setRemoveView(false);
        });
    }

    this.removeChoice = (index) => {
        if (this.numChoices + 1 > 2) {
            this.choices.splice(index, 1);
            getElementById('choiceDiv').children[index].remove();
            this.numChoices--;
            if (this.numChoices < 3) {
                this.hideRemove();
            }
        }
    }

    this.addChoice = (choice, choice_id = null, isAnswer = false) => {
        if (this.numChoices < 4) {
            let newChoice = new Choice(choice, choice_id, isAnswer, this, this.numChoices++);
            this.choices.push(newChoice);
            let choiceDiv = getElementById('choiceDiv');
            choiceDiv.insertBefore(
                newChoice.renderEdit(true),
                choiceDiv.children[choiceDiv.children.length]);
            if ((this.numChoices + 1) > 2) {
                this.showRemove();
            }
        }
    }

    let postQuestion = () => {
        if (this.hasRequirements()) {
            (async () => {
                let result = await fetch(`${urlSite}/admin/questions`, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.getJson())
                }).then((res) => {
                    if (res.ok) return res.json();
                }).then((res) => {
                    let data = JSON.parse(JSON.stringify(this.getJson()));
                    data['question_id'] = res.question_id;
                    for (let i = 0; i < data['choices'].length; i++) {
                        data.choices[i].choice_id = res.choices[i];
                    }
                    this.quiz.addQuestion(data['question'], res.question_id, data['choices']);
                    this.clearQuestion();
                })
            })();
        } else {
            alert('all inputs for the question must be filled');
        }
    }

    this.updateQuestion = () => {
        (async () => {
            let result = await fetch(urlSite + '/admin/questions', {
                method: 'put',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.getJson())
            }).then((res) => {
                if (res.ok) return res.json();
            }).then((res) => {
                console.log(res);
            })
        })();
    }

    this.renderEdit = (canUpdate = false, canEditChoice = false) => {
        let dom = createElement('div');
        let quizTitleInput = createElement('textarea');
        elements['quizTitleInput'] = quizTitleInput;
        quizTitleInput.setAttribute('type', 'text');
        quizTitleInput.setAttribute('required', 'true');
        quizTitleInput.value = this.question;
        dom.appendChild(quizTitleInput);

        let choiceDiv = createElement('div');
        choiceDiv.id = 'choiceDiv';
        for (let i = 0; i < this.choices.length; i++) {
            choiceDiv.appendChild(this.choices[i].renderEdit(canEditChoice));
        }
        dom.appendChild(choiceDiv);

        if (canEditChoice) {
            let btnAddChoice = createElement('button');
            btnAddChoice.innerText = 'Add Choice';
            btnAddChoice.addEventListener('click', () => this.addChoice(''));
            btnAddChoice.classList.add('btn', 'btn-primary')
            dom.appendChild(btnAddChoice);

            let btnAddQuestion = createElement('button');
            btnAddQuestion.innerText = 'Post Question';
            btnAddQuestion.classList.add('btn', 'btn-primary')
            btnAddQuestion.addEventListener('click', () => {
                postQuestion()
            });
            dom.appendChild(btnAddQuestion);
        }
        else if (canUpdate) {
            let btnUpdateQuestion = createElement('button');
            btnUpdateQuestion.innerText = 'Update';
            btnUpdateQuestion.addEventListener('click', () => { this.updateQuestion() });
            dom.appendChild(btnUpdateQuestion);
            this.checkChoice();
        }
        return dom;
    }

}

function Choice(choice, choice_id, isAnswer, question, index) {
    this.choice = choice;
    this.choice_id = choice_id;
    this.question = question;
    this.isAnswer = isAnswer || false;
    let elements = {};

    this.getJson = () => {
        let data = {};
        data['choice'] = elements['editChoiceInput'].value;
        if (this.choice_id)
            data['choice_id'] = this.choice_id;
        else
            data['choice_id'] = -1;
        data['answer'] = elements['radBtn'].checked;
        data['isAnswer'] = elements['radBtn'].checked;
        return data;
    }

    this.hasRequirements = () => {
        if(elements['editChoiceInput'].value)
            return true;
        return false;
    }

    this.radHasRequirement = () => {
        return elements['radBtn'].checked;
    }

    this.setRemoveView = (show = false) => {
        if (show == true) {
            this.removeChoiceBtn.style.display = 'inline';
        } else {
            this.removeChoiceBtn.style.display = 'none';
        }
    }

    this.clearChoice = () => {
        elements['editChoiceInput'].value = '';
        elements['radBtn'].checked = false;
    }

    this.setCheckRadio = (check) => {
        elements['radBtn'].checked = check;
    }

    this.renderEdit = (canRemove = false) => {
        let dom = createElement('div');

        let radBtn = createElement('input');
        elements['radBtn'] = radBtn;
        radBtn.setAttribute('type', 'radio');
        radBtn.setAttribute('required', 'true');
        if (this.question['question_id'] != null)
            radBtn.setAttribute('name', this.question.question_id);
        dom.appendChild(radBtn);

        let editChoiceInput = createElement('input');
        elements['editChoiceInput'] = editChoiceInput;
        editChoiceInput.setAttribute('type', 'text');
        editChoiceInput.setAttribute('required', 'true');
        editChoiceInput.value = choice;
        dom.appendChild(editChoiceInput);

        if (canRemove) {
            this.removeChoiceBtn = createElement('button');
            this.removeChoiceBtn.innerText = '-';
            this.removeChoiceBtn.addEventListener('click', () => question.removeChoice(index));
            this.removeChoiceBtn.style.display = 'none';
            dom.appendChild(this.removeChoiceBtn);
        }

        return dom;
    }
}