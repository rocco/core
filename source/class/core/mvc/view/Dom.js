/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

"use strict";

/**
 * Base class for a DOM based view. Uses debounced rendering using RequestAnimationFrame
 * for optimal performance. Supports easy DOM event managment for view content.
 */
core.Class("core.mvc.view.Dom",
{
  include : [core.mvc.view.Abstract],
  implement : [core.mvc.view.IView],

  construct: function(presenter, root)
  {
    core.mvc.view.Abstract.call(this, presenter);

    if (root != null) 
    {
      if (jasy.Env.isSet("debug")) {
        core.Assert.isType(root, "Node", "Invalid root node!");  
      }
      
      this.setRoot(root);
    }
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

  events :
  {
    /** Fired whenever the view has been rendered */
    render : core.event.Simple

  },

  members : 
  {
    /*
    ======================================================
      DEBOUNCED RENDER LOGIC
    ======================================================
    */

    // Interface implementation
    render : function()
    {
      if (this.__renderScheduled != null) {
        return;
      }

      /**  */
      this.__renderScheduled = core.effect.AnimationFrame.request(core.Function.bind(this.__renderRequest, this));
    },


    __renderRequest : function()
    {
      if (this._shouldRender()) 
      {
        this.__render();
        this.__renderScheduled = null;
      }
      else
      {
        this.__renderScheduled = core.effect.AnimationFrame.request(core.Function.bind(this.__renderRequest, this));
      }
    },


    /**
     * Internal render method which is called in buffered mode
     * so that only one rendering happens per frame.
     */
    __render : function()
    {
      var presenter = this.getPresenter();
      var elem = this.getRoot();
      var template = this.getTemplate();

      if (!presenter || !elem || !template) {
        return;
      }

      var partials = this.getPartials();
      var labels = this.getLabels();

      this._beforeRender();
      elem.innerHTML = template.render(presenter, partials, labels);
      this._afterRender();

      // Let others know
      this.fireEvent("render");
    },


    _shouldRender : function() {
      return this.__assetLoadCounter == 0;
    },


    _beforeRender : function() {
      // placeholder
    },


    _afterRender : function() {
      // placeholder
    },



    /*
    ======================================================
      PUBLIC API
    ======================================================
    */

    // Interface implementation
    show : function(approach)
    {
      var elem = this.getRoot();
      if (!elem) {
        return;
      }

      elem.style.display = "block";
      this.fireEvent("show");
    },


    // Interface implementation
    hide : function(approach)
    {
      var elem = this.getRoot();
      if (!elem) {
        return;
      }

      elem.style.display = "none";
      this.fireEvent("hide");
    },


    /**
     * {Object} Returns the event parent which is used to bubble view events, to
     */
    getEventParent : function() {
      return this.getPresenter();
    },



    /*
    ======================================================
      REMOTE ASSET LOADING
    ======================================================
    */

    loadPartial2 : function(name, tmpl)
    {
      var promise = core.event.Promise.obtain();

      core.io.Text.load(jasy.Asset.toUri(tmpl), function(uri, errornous, data) 
      {
        // Enable stripping (to remove white spaces from formatting)
        var template = core.template.Compiler.compile(data.text, this.getLabels());
        this.addPartial(template, name);

        errornous ? promise.reject("io") : promise.fulfill(data);
        promise.release();
      }, this);

      return promise;
    },

    loadTemplate2 : function(tmpl)
    {
      var promise = core.event.Promise.obtain();

      core.io.Text.load(jasy.Asset.toUri(tmpl), function(uri, errornous, data) 
      {
        // Enable stripping (to remove white spaces from formatting)
        var template = core.template.Compiler.compile(data.text, this.getLabels());
        this.setTemplate(template);  

        errornous ? promise.reject("io") : promise.fulfill(data);
        promise.release();
      }, this);

      return promise;
    },

    loadStyleSheet2 : function(tmpl)
    {
      var promise = core.event.Promise.obtain();

      core.io.StyleSheet.load(jasy.Asset.toUri(tmpl), function(uri, errornous, data) 
      {
        errornous ? promise.reject("io") : promise.fulfill(data);
        promise.release();
      }, this);

      return promise;
    },







    /** {=Integer} Number of assets currently being loaded */
    __assetLoadCounter : 0,


    /**
     * Loads the given @tmpl {Uri} via the text loader (XHR) and creates
     * a new template instance which is auto applied to the #text property afterwards.
     */
    loadTemplate : function(tmpl, nocache)
    {
      this.__assetLoadCounter++;
      core.io.Text.load(jasy.Asset.toUri(tmpl), this.__loadTemplateCallback, this, nocache);      
    },


    __loadTemplateCallback : function(uri, errornous, data) 
    {
      this.__assetLoadCounter--;

      if (errornous) {
        throw new Error("Could not load template: " + uri + "!");
      }

      // Enable stripping (to remove white spaces from formatting)
      this.setTemplate(core.template.Compiler.compile(data.text, this.getLabels()));  
    },

    loadStyleSheet : function(sheet, nocache)
    {
      this.__assetLoadCounter++;
      core.io.StyleSheet.load(jasy.Asset.toUri(sheet), this.__loadStyleSheetCallback, this, nocache);
    },

    __loadStyleSheetCallback : function(uri, errornous) 
    {
      this.__assetLoadCounter--;

      if (errornous) {
        throw new Error("Could not load style sheet: " + uri + "!");
      }
    }
  }
});
