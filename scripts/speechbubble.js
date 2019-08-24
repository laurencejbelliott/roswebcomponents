// load CSS function
loadCSS = function(href) {
  var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
  $("head").append(cssLink);
};

// load speechbubble css
loadCSS("/styles/speechbubble.css");

function robot_speech_bubble(text) {
  bubble_el = '<p class="speech" style="display:none">' + text + '</p>';
  $("body").append(bubble_el);
  return $(".speech")
}
