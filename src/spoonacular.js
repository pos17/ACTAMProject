var key="763fb7be9fa7445b836c7d0967859cda"

const SpoonacularApi =  require('spoonacular_pox');
let defaultClient = SpoonacularApi.ApiClient.instance;
// Configure API key authorization: apiKeyScheme
let apiKeyScheme = defaultClient.authentications['apiKeyScheme'];
apiKeyScheme.apiKey = key;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKeyScheme.apiKeyPrefix = 'Token';

let apiInstance = new SpoonacularApi.RecipesApi();
let id = 716423; // Number | The id of the ingredient you want the amount for.

let opts = {
  'limitLicense': true, // Boolean | Whether the recipes should have an open license that allows display with proper attribution.
  'tags': "tags_example", // String | The tags (can be diets, meal types, cuisines, or intolerances) that the recipe must have.
  '_number': 10 // Number | The maximum number of items to return (between 1 and 100). Defaults to 10.
};

apiInstance.getRecipeInformation(id, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
    console.table(data)
  }
});
/*
opts2 = {
  'stepBreakdown': false // Boolean | Whether to break down the recipe steps even more.
};
apiInstance.getAnalyzedRecipeInstructions(id, opts2, (error, data2, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data2);
    console.table(data2)
  }
});*/