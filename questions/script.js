let questions = [];
let currentQuestionIndex = 0;
let answers = [];

async function loadQuestions() {
    const response = await fetch('./questions.json'); // Corrected path
    const data = await response.json();
    return data.questions;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    
    // Clear previous selection
    document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
}

function handleAnswer() {
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    if (!selectedRating) {
        alert("Please select a rating before proceeding.");
        return;
    }

    answers.push({
        questionId: questions[currentQuestionIndex].id,
        temperament: questions[currentQuestionIndex].temperament,
        rating: parseInt(selectedRating.value)
    });

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const temperamentScores = {};
    answers.forEach(answer => {
        if (!temperamentScores[answer.temperament]) {
            temperamentScores[answer.temperament] = 0;
        }
        temperamentScores[answer.temperament] += answer.rating;
    });

    const sortedTemperaments = Object.entries(temperamentScores)
        .sort((a, b) => b[1] - a[1]);

    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    sortedTemperaments.forEach(([temperament, score]) => {
        const li = document.createElement('li');
        li.textContent = `${temperament}: ${score}`;
        resultsList.appendChild(li);
    });

    document.getElementById('survey-container').style.display = 'none';
    resultsContainer.style.display = 'block';
}

document.getElementById('generate-pdf-button').addEventListener('click', () => {
    generatePDF(sortedTemperaments);
});


function generatePDF(results) {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.text("Your Spiritual Temperament Results", 10, 10);
results.forEach(([temperament, score], index) => {
    doc.text(`${temperament}: ${score}`, 10, 20 + (index * 10));
});

doc.save("results.pdf");
}

async function initSurvey() {
    questions = await loadQuestions();
    shuffleArray(questions);
    displayQuestion();

    document.getElementById('next-button').addEventListener('click', handleAnswer);
}

window.addEventListener('load', initSurvey);