function handler(event) {
  var request = event.request;
  var uri = cleanPath(request.uri);

  var toWww = wwwRedirect(request, uri);
  if (toWww) return toWww;

  var moved = redirectFor(uri, request);
  if (moved) return moved;

  // A versão B só é servida na URL da própria página.
  for (var i = 0; i < TESTS.length; i++) {
    if (uri === TESTS[i].page + "b.html")
      return redirect(TESTS[i].page + queryString(request));
  }

  var last = uri.split("/").pop();
  if (uri.charAt(uri.length - 1) !== "/" && last.indexOf(".") === -1) {
    return redirect(uri + "/" + queryString(request));
  }
  if (uri.charAt(uri.length - 1) === "/") uri += "index.html";

  var t = testFor(uri);
  if (t && decide(request, event.context.requestId, t).variant === "b")
    uri = t.page + "b.html";

  request.uri = uri;
  return request;
}
