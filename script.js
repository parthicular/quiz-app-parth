document.addEventListener('DOMContentLoaded', () => {
  // Functions
  function buildQuiz() {
    let slides = [];
    for (let i = 0; i < myQuestions.length; i += 2) {
      const currentQuizQuestion = myQuestions[i];
      const currentDataQuestion = myQuestions[i + 1];

      let quizAnswers = '';
      if (currentQuizQuestion.type === "multiple-choice") {
        for (let letter in currentQuizQuestion.answers) {
          quizAnswers += `
            <label>
              <input type="radio" name="question${i}" value="${letter}">
              ${letter} :
              ${currentQuizQuestion.answers[letter]}
            </label>`;
        }
      }

      let dataAnswers = '';
      if (currentDataQuestion.type === "data-gathering-single") {
        for (let letter in currentDataQuestion.answers) {
          dataAnswers += `
            <label>
              <input type="radio" name="question${i + 1}" value="${letter}">
              ${currentDataQuestion.answers[letter]}
            </label>`;
        }
      } else if (currentDataQuestion.type === "data-gathering-multiple") {
        for (let option in currentDataQuestion.answers) {
          dataAnswers += `
            <label>
              <input type="checkbox" name="question${i + 1}" value="${option}">
              ${currentDataQuestion.answers[option]}
            </label>`;
        }
      }

      const slide = `
        <div class="slide">
          <div class="question">${currentQuizQuestion.question}</div>
          <div class="answers">${quizAnswers}</div>
          <div class="question">${currentDataQuestion.question}</div>
          <div class="answers">${dataAnswers}</div>
        </div>`;
      slides.push(slide);
    }

    quizContainer.innerHTML = slides.join('');
  }

  function showResults() {
    const answerContainers = quizContainer.querySelectorAll(".answers");
    let quizData = {
      name: localStorage.getItem('userName'),
      quizAnswers: {},
      dataAnswers: {},
    };
    let numCorrect = 0;

    myQuestions.forEach((currentQuestion, questionNumber) => {
      const answerContainer = answerContainers[questionNumber];
      let userAnswer = '';

      if (currentQuestion.type === "multiple-choice") {
        const selector = `input[name=question${questionNumber}]:checked`;
        userAnswer = (answerContainer.querySelector(selector) || {}).value;

        if (userAnswer === currentQuestion.correctAnswer) {
          numCorrect++;
        }

        quizData.quizAnswers[`question${questionNumber}`] = userAnswer;
      } else if (currentQuestion.type === "data-gathering-single") {
        const selector = `input[name=question${questionNumber}]:checked`;
        userAnswer = (answerContainer.querySelector(selector) || {}).value;

        quizData.dataAnswers[`question${questionNumber}`] = userAnswer;
      } else if (currentQuestion.type === "data-gathering-multiple") {
        const checkboxes = answerContainer.querySelectorAll('input[type=checkbox]:checked');
        userAnswer = [];
        checkboxes.forEach((checkbox) => {
          userAnswer.push(checkbox.value);
        });

        quizData.dataAnswers[`question${questionNumber}`] = userAnswer.join(',');
      }
    });

    localStorage.setItem('quizResults', `${numCorrect} out of ${myQuestions.filter(q => q.type === 'multiple-choice').length} correct`);

    fetch("http://127.0.0.1:5000/quiz", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quizData: quizData,
      }),
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then(data => {
      console.log("Quiz data sent successfully:", data);
      
      window.location.href = "results.html";
    })
    .catch(error => {
      console.error("Error sending quiz data:", error);
      resultsContainer.innerHTML = `Error submitting quiz. Please try again.`;
    });
  }

function updateProgressBar() {
  const slides = document.querySelectorAll('.slide');
  const progressBar = document.querySelector('.progress');

  const progressPercent = ((currentSlide + 1) / slides.length) * 100;

  progressBar.style.width = progressPercent + '%';
}

  function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
      if (index === n) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });
    currentSlide = n;

    if (currentSlide === 0) {
      previousButton.style.display = "none";
    } else {
      previousButton.style.display = "inline-block";
    }

    if (currentSlide === slides.length - 1) {
      nextButton.style.display = "none";
      submitButton.style.display = "inline-block";
    } else {
      nextButton.style.display = "inline-block";
      submitButton.style.display = "none";
    }

  
  updateProgressBar();
  }

  function areAllQuestionsAnswered(slideIndex) {
    const quizSlide = document.querySelectorAll('.slide')[slideIndex];
    const quizInputs = quizSlide.querySelectorAll('input[type=radio], input[type=checkbox]');
  
    for (let input of quizInputs) {
      if (input.type === 'radio') {
        if (!quizSlide.querySelector(`input[name=${input.name}]:checked`)) {
          return false;
        }
      } else if (input.type === 'checkbox') {
        if (input.checked) {
          return true;
        }
      }
    }
    return true;
  }

  function showNextSlide() {
    if (areAllQuestionsAnswered(currentSlide)) {
      showSlide(currentSlide + 1);
    } else {
      alert('Please answer all questions before proceeding.');
    }
  }

  function showPreviousSlide() {
    showSlide(currentSlide - 1);
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  let currentSlide = 0;

  const myQuestions = [
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What is considered the most environmentally friendly material for clothing production?",
        answers: {
            a: "Organic cotton",
            b: "Polyester",
            c: "Nylon",
            d: "Rayon",
        },
        correctAnswer: "a",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "What is your age range?",
        answers: {
            a: "Under 18",
            b: "18-25",
            c: "26-35",
            d: "36-45",
            e: "46-55",
            f: "56 and above",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "How does fast fashion contribute to environmental degradation?",
        answers: {
            a: "By promoting sustainable production practices",
            b: "By reducing textile waste",
            c: "By exploiting natural resources",
            d: "By encouraging slow fashion trends",
        },
        correctAnswer: "c",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "How often do you shop for clothing in a month?",
        answers: {
            a: "Once",
            b: "2-3 times",
            c: "4-6 times",
            d: "More than 6 times",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What does the term 'upcycling' refer to in the context of sustainable fashion?",
        answers: {
            a: "Recycling old clothing into new garments",
            b: "Donating used clothing to charity",
            c: "Buying second-hand clothing",
            d: "Repurposing discarded materials into new products",
        },
        correctAnswer: "d",
    },
    // Data Gathering Question
    {
        type: "data-gathering-multiple",
        question: "Which clothing brands do you frequently purchase from?",
        answers: {
            Shein: "Shein",
            Zara: "Zara",
            HM: "H&M",
            GAP: "GAP",
            OldNavy: "Old Navy",
            Primark: "Primark",
            VictoriaSecret: "Victoria’s Secret",
            UrbanOutfitters: "Urban Outfitters",
            AmericanEagle: "American Eagle",
            ASOS: "ASOS",
            Forever21: "Forever 21",
            AbercrombieFitch: "Abercrombie & Fitch",
            Guess: "Guess",
            Uniqlo: "Uniqlo",
            Boohoo: "Boohoo",
            PacSun: "PacSun",
            HotTopic: "Hot Topic",
            PrettyLittleThing: "Pretty Little Thing",
            Wish: "Wish",
            CIDER: "CIDER",
            Topshop: "Topshop",
            BrandyMelville: "Brandy Melville",
            Garage: "Garage",
            Romway: "Romway",
            NastyGal: "Nasty Gal",
            Mango: "Mango",
            Missguided: "Missguided",
            YesStyle: "YesStyle",
            FashionNova: "Fashion Nova",
            VRG_GRL: "VRG GRL",
            Edikted: "Edikted",
            Nike: "Nike",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "Which fashion industry practice leads to the exploitation of garment workers in developing countries?",
        answers: {
            a: "Fair trade agreements",
            b: "Ethical sourcing policies",
            c: "Outsourcing production to low-wage countries",
            d: "Unionized labor contracts",
        },
        correctAnswer: "c",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "What is your average spending on clothing per shopping trip?",
        answers: {
            a: "Under £50",
            b: "50-£100",
            c: "£100-£200",
            d: "Over £200",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What is the primary environmental concern associated with synthetic fibers like polyester?",
        answers: {
            a: "Biodegradability",
            b: "Water usage",
            c: "Greenhouse gas emissions",
            d: "Soil degradation",
        },
        correctAnswer: "c",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "Do you actively seek out sustainable fashion options when shopping?",
        answers: {
            a: "Always",
            b: "Sometimes",
            c: "Rarely",
            d: "Never",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What does the term 'circular fashion' refer to in the context of sustainability?",
        answers: {
            a: "A fashion trend that comes back in style cyclically",
            b: "A model that emphasizes recycling clothing waste into new textiles",
            c: "An eco-friendly fashion brand",
            d: "A type of clothing made from natural fibers",
        },
        correctAnswer: "b",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "How often do you dispose of clothing items (either by throwing away or donating)?",
        answers: {
            a: "Every few months",
            b: "Once a year",
            c: "Every few years",
            d: "Rarely",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What is the concept of a 'capsule wardrobe' in sustainable fashion?",
        answers: {
            a: "A wardrobe with only one color",
            b: "A small collection of versatile, timeless pieces",
            c: "A wardrobe for special occasions",
            d: "A wardrobe with designer labels",
        },
        correctAnswer: "b",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "Are you aware of the environmental impact of fast fashion?",
        answers: {
            a: "Yes, very aware",
            b: "Somewhat aware",
            c: "Not very aware",
            d: "Not aware at all",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "Which natural fiber is derived from the flax plant and is known for its durability and breathability?",
        answers: {
            a: "Wool",
            b: "Silk",
            c: "Linen",
            d: "Jute",
        },
        correctAnswer: "c",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "Have you made any changes to your shopping habits to support sustainable fashion?",
        answers: {
            a: "Yes, I consciously choose sustainable options",
            b: "I try to, but it's not always possible",
            c: "No, I haven't made any changes",
            d: "I'm not sure",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What is the purpose of the 'Fashion Revolution' movement?",
        answers: {
            a: "Promoting luxury fashion brands",
            b: "Advocating for sustainable fashion practices",
            c: "Encouraging fast fashion consumption",
            d: "Celebrating runway shows",
        },
        correctAnswer: "b",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "How important is sustainability in your decision-making process when purchasing clothing?",
        answers: {
            a: "Very important",
            b: "Somewhat important",
            c: "Not very important",
            d: "Not important at all",
        },
    },
    // Quiz Question
    {
        type: "multiple-choice",
        question: "What role does 'transparency' play in sustainable fashion practices?",
        answers: {
            a: "It promotes open communication between brands and consumers about production processes",
            b: "It refers to clothing that is sheer or see-through",
            c: "It dictates the usage of transparent materials in clothing designs",
            d: "It denotes the popularity of clear garment bags in retail stores",
        },
        correctAnswer: "a",
    },
    // Data Gathering Question
    {
        type: "data-gathering-single",
        question: "Would you be willing to pay a premium for sustainably produced clothing?",
        answers: {
            a: "Yes, I prioritize sustainability over price",
            b: "Maybe, depending on the product",
            c: "No, I prioritize affordability",
            d: "I'm not sure",
        },
    },
];


  buildQuiz();
  showSlide(currentSlide);
  updateProgressBar();

  submitButton.addEventListener("click", showResults);
  previousButton.addEventListener("click", showPreviousSlide);
  nextButton.addEventListener("click", showNextSlide);
});
