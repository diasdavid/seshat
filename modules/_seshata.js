
$(document).ready(function () {
  buzzardClient = require('buzzard');

  // Switch from empty anchors to id-ed headings
  $('a[name]').get().forEach(function (i) {
    var $i = $(i);

    $i.next().attr('id', $i.attr('name'));
    $i.detach();
  });

  $('.scroll-spy-target').on('activate.bs.scrollspy', function (event) {
    var $this = $(this);
    var $target = $(event.target);

    $this.scrollTo($target, 0, {
      offset: -($this.innerHeight() / 2)
    });
  });

  function truncate(json, length) {
    if (length === null) {
      length = 20;
    }

    var split = json.split('\n');

    if (split.length <= length) {
      return json;
    }

    return split.slice(0, length).join('\n') + '\n...';
  }

  $('[data-route]').each(function () {
    var $this = $(this);
    var $target = $($this.attr('data-target'));
    var route = $this.attr('data-route');
    var length = $this.attr('data-truncate') || Infinity;

    var method = $this.attr('data-method');
    var body = $this.attr('data-body');

    var requires_auth = $this.attr('data-requires-auth');
    var provides_auth = $this.attr('data-provides-auth');


    $this.click(function () {
      var header;
      var credentials;
      if (requires_auth){
        credentials = JSON.parse(sessionStorage.getItem('credentials'));
        if (credentials){
          console.log(credentials);
          header = buzzardClient.header(credentials);
        } else {
          return alert('you don\'t have credentials yet');
        }
      }

      var body_ready;

      if (body !== ''){
        var editable_body = $this.attr('data-target') + '-data-body';
        body_ready = JSON.parse($(editable_body).text());
      }


      $target.text('Loading ' + route + ' ...');

      $.ajax(route, {
        type: method,
        data: body_ready,
        success: function (data) {
          if(provides_auth){
            console.log('credentials: ', data);
            sessionStorage.setItem('credentials', JSON.stringify(data));
          }
          var json = truncate(JSON.stringify(data, null, 2), length);
          $target.text(json);
        },
        headers: {
          'Authorization': header
        }
      });
    });
  });
});