/*
 *  (c) Daniel Arroyo. 3DaGoGo, Inc. (daniel@astroprint.com)
 *
 *  Distributed under the GNU Affero General Public License http://www.gnu.org/licenses/agpl.html
 */

var AppRouter = Backbone.Router.extend({
	homeView: null,
	filesView: null,
	controlView: null,
	settingsView: null,
	printingView: null,
	terminalView: null,
	routes: {
		"": "home",
		"files": "files",
		"file-info/:fileId": "fileInfo",
		"control": "control",
		"printing": "printing",
		"settings": "settings",
		"settings/:page": "settings",
		"gcode-terminal": "terminal",
		"*notFound": "notFound"
	},
	turningOff: false,
  	execute: function(callback, args) {
  		if (callback) {
  			is_paused = app.socketData.get('paused');
  			if (app.socketData.get('printing') || is_paused) {
  				if 	(callback != this.printing &&
  					(callback != this.control || !is_paused)
  				) {
  					this.navigate('printing', {trigger: true, replace:true});
  					return;
  				}
  			} else if (callback == this.printing) {
  				this.navigate('', {trigger: true, replace:true});
  				return;
  			}

  			callback.apply(this, args);
  		}
	},
	home: function()
	{
		if (!this.homeView) {
			this.homeView = new HomeView({forceSync: false});
		}

		this.selectView(this.homeView);
		app.selectQuickNav('dash');
	},
	files: function()
	{
		if (!this.filesView) {
			this.filesView = new FilesView({forceSync: false});
		}

		this.selectView(this.filesView);
		app.selectQuickNav('files');
	},
	fileInfo: function(fileId)
	{
		var showDlg = _.bind(function(success) {
			if (success) {
				this.filesView.fileInfo(fileId);
			}
		}, this);

		if (this.filesView) {
			this.filesView.printFilesListView.refresh(true, showDlg);
		} else {
			this.filesView = new FilesView({
				forceSync: true,
				syncCompleted: showDlg
			});
		}

		this.navigate('files', {trigger: true, replace:true});
	},
	control: function()
	{
		if (!this.controlView) {
			this.controlView = new ControlView();
		}

		this.selectView(this.controlView);
		app.selectQuickNav('control');
	},
	printing: function()
	{
		if (!this.printingView) {
			this.printingView = new PrintingView();
		}

		this.selectView(this.printingView);
		app.$('.quick-nav').hide();
	},
	settings: function(page)
	{
		if (!this.settingsView) {
			this.settingsView = new SettingsView();
		}

		this.selectView(this.settingsView);
		this.settingsView.menu.changeActive(page || 'printer-connection');
		app.selectQuickNav('settings');
	},
	terminal: function() {
		if (!this.terminalView) {
			this.terminalView = new TerminalView();
		}

		this.selectView(this.terminalView);
	},
	selectView: function(view) {
		var currentView = app.$el.find('.app-view.active');
		var targetView = view.$el;

		if (targetView.data('fullscreen')) {
			$('#app').addClass('hide');
		}

		currentView.addClass('hide').removeClass('active');
		targetView.removeClass('hide').addClass('active');

		//fire events
		currentView.trigger('hide');
		targetView.trigger('show');

		if (view.$el.attr('id') == 'control-view') {
			this.controlView.tempView.resetBars();
		}

		app.selectQuickNav();
	},
	notFound: function()
	{
		this.navigate("", {trigger: true, replace: true});
	}
});
