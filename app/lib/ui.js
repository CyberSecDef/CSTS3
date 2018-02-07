/*
  Namespace: csts.libs.ui
  User Interface functions
*/
csts.libs.ui = {
  /*
    Method: status
    Updates, then fades the text on the status base

    Parameters:
              msg : The status bar msg

    Returns:
      NA

    See Also:

   */
  status(msg, fade) {
    $('#statusbar-text').text(msg);
    $('#statusbar-text').show();
    if (fade) {
      $('#statusbar-text').fadeOut(3000);
    }
  },
};

