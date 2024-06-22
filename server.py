from flask import Flask, request, jsonify
import csv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Assuming the total number of questions (quiz + data) is known
TOTAL_QUESTIONS = 20  # Adjust this number based on your actual questions

@app.route('/quiz', methods=['POST'])
def handle_quiz_submission():
    data = request.json
    quiz_data = data.get('quizData')
    
    csv_file = 'quiz_results.csv'
    file_exists = os.path.isfile(csv_file)
    
    with open(csv_file, mode='a', newline='') as file:
        fieldnames = ['name'] + [f'Quiz-Q{i+1}' for i in range(TOTAL_QUESTIONS // 2)] + [f'Data-Q{i+1}' for i in range(TOTAL_QUESTIONS // 2)]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        row_data = {'name': quiz_data['name']}
        
        # Process quiz answers
        for i, answer in enumerate(quiz_data['quizAnswers'].values()):
            row_data[f'Quiz-Q{i+1}'] = answer
        
        # Process data answers
        for i, answer in enumerate(quiz_data['dataAnswers'].values()):
            row_data[f'Data-Q{i+1}'] = answer
        
        writer.writerow(row_data)
    
    return jsonify({'status': 'success', 'message': 'Data saved successfully'})

if __name__ == '__main__':
    app.run(debug=True)
