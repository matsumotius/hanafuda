// todo: next, prev
(function($){
    var Util = {
        foreach : function(_array, callback){
            for(var i=0;i<_array.length;i++){
                callback(_array[i], i);
            }
        },
        swap : function(_array, a, b){
            var tmp = _array[a];
            _array[a] = _array[b];
            _array[b] = tmp;
            return _array;
        },
        'Number' : function(value){
            return {
                is_between : function(a, b){ return a <= value && value <= b; }
            };
        }
    };
    var generate_suggestion = function(css){
        var obj = $('<li>').css('list-style', 'none');
        for(var key in css) obj.css(key, css[key]);
        return obj;
    };
    var apply_unselectable = function(target){
        target.css('user-select', 'none'); // CSS3
        target.css('-webkit-user-select', 'none'); // webkit
        target.css('-moz-user-select', 'none'); // firefox
        target.css('-khtml-user-select', 'none'); // safari
        target.attr('unselectable', 'on'); // IE
    };
    var Hanafuda = function(_target, _options){
        this.events = { 'drop' : [], 'drug' : [] };
        this.target = _target;
        apply_unselectable($(this.target).find('li'));
        this.options = _options;
        this.list = $(this.target).find('li');
        this.list_clone = $(this.list).clone();
        this.list_unselected = [];
        this.drugging = null;
        this.suggesting = { target : null, index : -1 };

        var that = this;
        $(this.target).find('li').live('mousedown', function(e){
            if(that.drugging !== null) return;
            var drugging_index = $(that.target).find('li').index(this);
            var drugging_clone = $(this).clone();
            $(that.list).css('cursor', 'move');
            $(this).css('position', 'absolute');
            $(this).css('z-index', '3');
            Util.foreach(that.list, function(el, index){
                if(drugging_index != index) that.list_unselected.push(el);
            });
            that.drugging = { target : this, index : drugging_index, clone : drugging_clone };
            apply_suggestion();
        });
        $('body').live('mousemove', function(e){
            if(that.drugging == null) return;
            $(that.drugging.target).css('top', e.pageY);
            $(that.drugging.target).css('left', e.pageX);
            apply_suggestion();
        });
        $(this.target).find('li').live('mouseup', function(e){
            if(that.drugging == null) return;
            $('body').css('cursor', 'auto');
            $(that.target).find('li').css('cursor', 'pointer');
            $(this).css('z-index', '1');
            that.list.sort(function(a, b){ return $(a).offset().top - $(b).offset().top; });
            var drugging_index = $(that.list).index(that.drugging.target);
            $(that.target).find('li').remove();
            Util.foreach(that.list, function(el, index){
                $(that.target).append((drugging_index !== index)? el : that.drugging.clone);
            });
            that.reset();
        });
        var apply_suggestion = function(){
            var offset = $(that.drugging.target).offset();
            var height = $(that.drugging.target).height();
            var last_el = that.list_unselected[that.list_unselected.length - 1];
            var last_index = that.list_unselected.length - 1;
            var suggesting_target = generate_suggestion({ height : height });
            Util.foreach(that.list_unselected, function(el, index) {
                if(Util.Number($(el).offset().top).is_between(offset.top, offset.top + height)){
                    if(that.suggesting.index == index) return;
                    if(that.suggesting.target !== null) that.suggesting.target.remove();
                    $(that.list_unselected[index]).before(suggesting_target);
                    that.suggesting = { target : suggesting_target, index : index };
                }
            });
            if(Util.Number($(last_el).offset().top + $(last_el).height()).is_between(offset.top, offset.top + height)){
                if(that.suggesting.index !== last_index) return;
                if(that.suggesting.target !== null) that.suggesting.target.remove();
                $(last_el).after(suggesting_target);
                that.suggesting = { target : suggesting_target, index : last_index };
            }
        }
    };
    Hanafuda.prototype.on = function(ev, callback){
        if(false === (ev in this.events)) return;
        this.evnets[ev].push(callback);
    };
    Hanafuda.prototype.add = function(el){
        return {
            to : function(index) {
                // append to DOM     
            }
        };
    };
    Hanafuda.prototype.refresh = function(){
        this.list = $(this.target).find('li');
        this.list_clone = $(this.list).clone();
    };
    Hanafuda.prototype.reset = function(){
        this.list = $(this.target).find('li');
        this.list_clone = $(this.list).clone();
        this.list_unselected = [];
        this.drugging = null;
        if(this.suggesting.target !== null) this.suggesting.target.remove();
        this.suggesting = { target : null, index : -1 };
    };
    $.fn.hanafuda = function(){
        return new Hanafuda(this, {});
    };
})(jQuery);

