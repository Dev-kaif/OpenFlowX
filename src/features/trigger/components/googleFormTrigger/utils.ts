export const generateGoogleFormScript = (webhookUrl: string) => `
function normalizeKey(key) {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  var responses = {};
  var responseMeta = {}; // keeps original titles

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle();

    var safeKey = normalizeKey(title);

    // Handle duplicate keys
    var finalKey = safeKey;
    var counter = 1;
    while (responses.hasOwnProperty(finalKey)) {
      finalKey = safeKey + "_" + counter;
      counter++;
    }

    responses[finalKey] = itemResponse.getResponse();
    responseMeta[finalKey] = title;
  }

  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses,
    responseMeta: responseMeta
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  var WEBHOOK_URL = "${webhookUrl}";

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch (error) {
    console.error("Webhook failed:", error);
  }
}
`;
