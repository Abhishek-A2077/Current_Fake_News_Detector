// src/services/api.ts
const API_URL = '/api';

type TruthfulnessScore = {
  prediction: string;       // One of: 'pants-fire', 'false', 'barely-true', 'half-true', 'mostly-true', 'true'
  scores: Record<string, number>;  // Scores for each category
  binary_prediction: string;  // Backward compatibility: 'real' or 'fake'
};

export const predictNews = async (text: string): Promise<TruthfulnessScore> => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error predicting news:', error);
    throw error;
  }
};
