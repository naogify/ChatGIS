import getStyleArguments from "../../utils/getStyleArguments";

export default async function (req, res) {

  const input = req.body.input || '';
  if (input.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text input.",
      }
    });
    return;
  }

  try {
    const styleArguments = await getStyleArguments(input);

    console.log(styleArguments);

    res.status(200).json(styleArguments);
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${JSON.stringify(error.message)}`);
      res.status(500).json({
        error: {
          message: error.message || 'An error occurred during your request.',
        }
      });
    }
  }
}
