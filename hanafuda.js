// todo: next, prev
(function($){
    var HanafudaManager = function(){
        this.list = [];
    };
    HanafudaManager.prototype.add = function(hanafuda){
        if(this.list.indexOf(hanafuda) == -1) this.list.push(hanafuda);
    };
    HanafudaManager.prototype.join = function(a, b){

    };
    var manager = new HanafudaManager();
    var HanafudaView = function(_parent){
        this.__parent = _parent;
    };
    HanafudaView.prototype.make_unselectable = function(_target){
        var target = $(_target);
        target.css('user-select', 'none'); // CSS3
        target.css('-webkit-user-select', 'none'); // webkit
        target.css('-moz-user-select', 'none'); // firefox
        target.css('-khtml-user-select', 'none'); // safari
        target.attr('unselectable', 'on'); // IE
    };
    HanafudaView.prototype.make_drugging = function(_target, _list){
        var target = $(_target), list = $(_list);
        target.css('position', 'absolute');
        target.css('z-index', '3');
        target.css('cursor', 'move');
        $('body').css('cursor', 'move');
        list.find('li').css('cursor', 'move');
    };
    HanafudaView.prototype.reset = function(target){
        $('body').css('cursor', 'auto');
        $(target).find('li').css('z-index', '1');
        $(target).find('li').css('cursor', 'pointer');
    };
    HanafudaView.prototype.move = function(target, x, y){
        $(target).css('left', x);
        $(target).css('top', y);
    };
    HanafudaView.prototype.generate_suggestion = function(css){
        var obj = $('<li>').css('list-style', 'none');
        for(var key in css) obj.css(key, css[key]);
        return obj;
    };

    var HanafudaEvent = function(_parent){
        this.__parent = _parent;
        this.list = {};
        this.name_list = ['drug', 'move', 'drop'];
    };
    HanafudaEvent.prototype.add = function(name, callback){
        if(this.name_list.indexOf(name) === -1) return;
        (name in this.list) ? this.list[name].push(callback) : this.list[name] = [callback];
    };
    HanafudaEvent.prototype.fire = function(name){
        if(this.name_list.indexOf(name) === -1) return;
        if(false === (name in this.list)) return;
        $.each(this.list[name], function(index, callback){ callback(); });
    };

    var Hanafuda = function(_target, _options){
        this.target = _target;
        this.options = _options;
        this.list = $(this.target).find('li');
        this.list_clone = $(this.list).clone();
        this.list_stack = [];
        this.view = new HanafudaView(this);
        this.events = new HanafudaEvent(this);
        this.is_drugging = false;
        this.drugging = {};
        this.suggesting = { target : null, index : -1 };

        this.view.make_unselectable(this.target);
        this.view.make_unselectable(this.list);
        var that = this;
        $(this.target).find('li').live('mousedown', function(e){
            that.grab(this, e);
        });
        $('body').live('mousemove', function(e){
            that.move(this, e);
        });
        $('body').live('mouseup', function(e){
            that.release(this, e);
        });
    };
    Hanafuda.prototype.on = function(name, callback){
        this.events.add(name, callback);
    };
    Hanafuda.prototype.grab = function(_target, e){
        if(this.is_drugging) return;
        this.drugging = { 
            target : _target, 
            index : $(this.list).index(_target), 
            clone : $(_target).clone(),
            point : { x : e.pageX - $(_target).offset().left, y : e.pageY - $(_target).offset().top }
        };
        var that = this;
        $.each($(this.target).find('li'), function(index, obj){
            if(that.drugging.index !== index) that.list_stack.push(obj);
        });
        this.view.make_drugging(_target, this.target);
        this.is_drugging = true;
        this.suggest();
    };
    Hanafuda.prototype.move = function(target, e){
        if(this.is_drugging == false) return;
        this.view.move(this.drugging.target, e.pageX - this.drugging.point.x, e.pageY - this.drugging.point.y);
        this.suggest();
    };
    Hanafuda.prototype.release = function(target, e){
        if(this.is_drugging == false) return;
        this.view.reset(this.target);
        this.list.sort(function(a, b){ return $(a).offset().top - $(b).offset().top; });
        var drugging_index = $(this.list).index(this.drugging.target);
        $(this.target).find('li').remove();
        var that = this;
        $.each(this.list, function(index, obj){
            $(that.target).append((drugging_index !== index)? obj : that.drugging.clone);
        });
        this.reset();
    };
    Hanafuda.prototype.suggest = function(){
        var offset = $(this.drugging.target).offset();
        var height = $(this.drugging.target).height();
        var last_obj = this.list_stack[this.list_stack.length - 1];
        var last_index = this.list_stack.length - 1;
        var suggesting_target = this.view.generate_suggestion({ height : height });
        var that = this;
        $.each(that.list_stack, function(index, obj) {
            if($(obj).offset().top >= offset.top && 
               $(obj).offset().top <= offset.top + height){
                if(that.suggesting.index == index) return;
                if(that.suggesting.target !== null) that.suggesting.target.remove();
                $(that.list_stack[index]).before(suggesting_target);
                that.suggesting = { target : suggesting_target, index : index };
            }
        });
        if($(last_obj).offset().top + $(last_obj).height() >= offset.top && 
           $(last_obj).offset().top + $(last_obj).height() <= offset.top + height){
            if(this.suggesting.index !== last_index) return;
            if(this.suggesting.target !== null) this.suggesting.target.remove();
            $(last_obj).after(suggesting_target);
            this.suggesting = { target : suggesting_target, index : last_index };
        }
    };
    Hanafuda.prototype.reset_list = function(){
        this.list = $(this.target).find('li');
        this.list_clone = $(this.list).clone();
    };
    Hanafuda.prototype.reset = function(){
        this.reset_list();
        this.list_stack = [];
        this.is_drugging = false;
    };
    Hanafuda.prototype.join = function(hanafuda){
        if(manager.list.indexOf(hanafuda) == -1) return;
        console.log(manager);
    };
    $.fn.hanafuda = function(){
        var hanafuda = new Hanafuda(this, {});
        manager.add(hanafuda);
        return hanafuda;
    };
})(jQuery);

