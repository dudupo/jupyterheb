"using strict";


requirejs.config({
    shim: {
        'bidiweb.html_css': ['bidiweb'],
        'bidiweb.css': ['bidiweb']
    }
});



$([IPython.events]).on('app_initialized.NotebookApp', function(){

  $.getScript("https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML", function(){



  });

  require(['custom/bidiweb'],function(css){
        bidiweb.css('.rendered_html *');

 require(['components/marked/lib/marked'] ,function(marked) {
    IPython.MarkdownCell.prototype.render = function () {
         var cont =  IPython.TextCell.prototype.render.apply(this);
         if (cont) {
             var that = this;
             var text = this.get_text();
             var math = null;
             if (text === "") { text = this.placeholder; }
             var text_and_math = IPython.mathjaxutils.remove_math(text);
             text = text_and_math[0];
             math = text_and_math[1];
             marked(text, function (err, html) {
                 html = bidiweb.html_css(html);
                 html = IPython.mathjaxutils.replace_math(html, math);
                 html = IPython.security.sanitize_html(html);
                 html = $($.parseHTML(html));
                 // add anchors to headings
                 html.find(":header").addBack(":header").each(function (i, h) {
                     h = $(h);
                     var hash = h.text().replace(/ /g, '-');
                     h.attr('id', hash);
                     h.append(
                         $('<a/>')
                             .addClass('anchor-link')
                             .attr('href', '#' + hash)
                             .text('¶')
                             .on('click',function(){
                                 setTimeout(function(){that.unrender(); that.render()}, 100)
                             })
                     );
                 });
                 // links in markdown cells should open in new tabs
                 html.find("a[href]").not('[href^="#"]').attr("target", "_blank");
                 that.set_rendered(html);
                 that.typeset();
                 that.events.trigger("rendered.MarkdownCell", {cell: that});
             });
         }
         return cont;
     };
   });
 });
});
