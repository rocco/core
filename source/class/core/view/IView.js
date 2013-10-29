/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2013 Sebastian Werner
==================================================================================================
*/

"use strict";

/**
 * Generic interface which should be fulfilled by all view classes.
 */
core.Interface("core.view.IView",
{
  /**
   * @presenter {core.presenter.Abstract} Presenter instance to connect to
   */
  // Not supported yet
  // construct: function(presenter) {},

  events :
  {
    /** Fired after the view has been shown */
    "show" : core.event.Simple,

    /** Fired after the view has been hidden */
    "hide" : core.event.Simple
  },

  members :
  {
    /**
     * {core.presenter.Abstract} Returns the attached presenter instance
     */
    getPresenter : function() {},

    /**
     * Renders the view using data from the attached presenter.
     */
    render : function() {},

    /**
     * Hides the view using the given @approach {String?}.
     */
    hide : function(approach) {},

    /**
     * Shows the view using the given @approach {String?}.
     */
    show : function(approach) {}
  }
});
