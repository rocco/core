/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

core.Class("core.mvc.view.Dom",
{
  include : [core.mvc.view.Abstract],
  implement : [core.mvc.view.IView],

  construct: function(presenter) {
    core.mvc.view.Abstract.call(this, presenter);
  },

  properties : 
  {
    /** Instance of compiled template to produce final data / text for output e.g. HTML, JSON, ... */
    template : 
    {
      type: core.template.Template,
      nullable : true,
      apply : function() {
        this.render();
      }
    },

    /** The root element to render into */
    root : 
    {
      type: "Node",
      nullable : true,
      apply : function(value, old) {
        this.render();
      }
    }
  },

  members : 
  {
    // Interface implementation
    render : function()
    {
      if (this.__renderScheduled) {
        return;
      }

      this.__renderScheduled = true;

      var self = this;

      /** #require(ext.RequestAnimationFrame) */
      requestAnimationFrame(function() {
        self.__render();
        self.__renderScheduled = false;
      });
    },


    /**
     * Internal render method which is called in buffered mode
     * so that only one rendering happens per frame.
     */
    __render : function()
    {
      var elem = this.getRoot();
      if (!elem) {
        return;
      }

      var template = this.getTemplate();
      if (!template) {
        return;
      }

      var presenter = this.getPresenter() || {};
      if (this.getPresenter() == null) {
        this.warn("Missing presenter!");
      }

      this.log("Rendering view...");
      elem.innerHTML = template.render(presenter);
      return this;      
    },


    // Interface implementation
    show : function()
    {
      var elem = this.getRoot();
      if (!elem) {
        return;
      }

      elem.style.display = "";
      this.fireEvent("show");
    },


    // Interface implementation
    hide : function()
    {
      var elem = this.getRoot();
      if (!elem) {
        return;
      }

      elem.style.display = "none";
      this.fireEvent("hide");
    },


    /**
     * Loads the given @tmpl {Uri} via the text loader (XHR) and creates
     * a new template instance which is auto applied to the #text property afterwards.
     */
    loadTemplate : function(tmpl)
    {
      core.io.Text.load(jasy.Asset.toUri(tmpl), function(uri, errornous, data) 
      {
        if (errornous) {
          throw new Error("Could not load template: " + uri + "!");
        }

        this.setTemplate(core.template.Compiler.compile(data.text));  
      }, this);      
    }
  }
});
