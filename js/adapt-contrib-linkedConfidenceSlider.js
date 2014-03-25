/*
* adapt-contrib-linkedConfidenceSlider
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kev Adsett <kev.adsett@kineo.com>
*/

define(function(require) {
    var Slider = require('components/adapt-contrib-slider/js/adapt-contrib-slider');
    var ConfidenceSlider = require('components/adapt-contrib-confidenceSlider/js/adapt-contrib-confidenceSlider');
    var Adapt = require('coreJS/adapt');

    var LinkedConfidenceSlider = ConfidenceSlider.extend({
        events: {
            'click .linkedConfidenceSlider-item-outer-bar': 'onItemBarSelected',
            'click .linkedConfidenceSlider-item-bar-background': 'onItemBarSelected',
            'click .linkedConfidenceSlider-item-indicator-bar': 'onItemBarSelected',
            'click .linkedConfidenceSlider-item-handle': 'preventEvent',
            'touchstart .linkedConfidenceSlider-item-handle':'onHandlePressed',
            'mousedown .linkedConfidenceSlider-item-handle': 'onHandlePressed',
            'focus .linkedConfidenceSlider-item-handle':'onHandleFocus',
            'click .linkedConfidenceSlider-widget .button.submit': 'onSubmitClicked',
        },

        animateToPosition: function(newPosition) {
            this.$('.linkedConfidenceSlider-item-handle').stop(true).animate({
                left: newPosition + 'px'
            }, 300, _.bind(function(){
                this.setNormalisedHandlePosition();
            }, this));
            this.$('.linkedConfidenceSlider-item-indicator-bar').stop(true).animate({
                width:newPosition + 'px'
            }, 300);
        },

        preRender: function() {
            this.setupLinkedModel();
            Slider.prototype.preRender.apply(this);
            this.model.set('_isEnabled', this.model.get('_linkedModel').get('_isSubmitted'));
        },

        setupLinkedModel: function() {
            var linkedModel = Adapt.components.findWhere({_id: this.model.get('_linkedToId')});
            this.model.set('_scale', _.clone(linkedModel.get('_scale')));
            this.model.set('axisLabel', linkedModel.get('axisLabel'));
            this.model.set('_linkedModel', linkedModel);
        },

        postRender: function() {
            this.setScalePositions();
            this.showAppropriateNumbers();
            this.listenToLinkedModel();
            if(this.model.get('_linkedModel').get('_isSubmitted')) {
                this.onLinkedConfidenceChanged(this.model.get('_linkedModel'));
            } else {
                this.$('.linkedConfidenceSlider-body').html(this.model.get('disabledBody'));
            }
            this.setNormalisedHandlePosition();
            Slider.prototype.postRender.apply(this);
        },

        resetQuestion: function(properties) {
            ConfidenceSlider.prototype.resetQuestion.apply(this, arguments);
            this.model.set({
                _linkedConfidence: 0
            });
        },

        listenToLinkedModel: function() {
            this.listenTo(this.model.get('_linkedModel'), 'change:_confidence', this.onLinkedConfidenceChanged);
            this.listenTo(this.model.get('_linkedModel'), 'change:_isSubmitted', this.onLinkedSubmittedChanged);
        },

        onLinkedConfidenceChanged: function(linkedModel) {
            this.model.set({
                _linkedConfidence: linkedModel.get('_confidence')
            });
            this.updateLinkedConfidenceIndicator();
        },

        onLinkedSubmittedChanged: function(linkedModel) {
            if(linkedModel.get('_isSubmitted')) {
                this.enableSelf();
            }
        },

        enableSelf: function() {
            this.model.set('_isEnabled', true);
            this.$('.linkedConfidenceSlider-widget').removeClass('disabled');
            this.$('.linkedConfidenceSlider-body').html(this.model.get('body'));
        },

        updateLinkedConfidenceIndicator: function() {
            this.$('.linkedConfidenceSlider-item-linked-confidence-bar').css({
                width: this.$('.linkedConfidenceSlider-item-bar').width() * this.model.get('_linkedConfidence')
            })
        },

        mapIndexToPixels: function(value) {
            var numberOfItems = this.model.get('items').length,
                width = this.$('.linkedConfidenceSlider-item-bar').width();
            
            return Math.round(this.mapValue(value, 0, numberOfItems - 1, 0, width));
        },
        
        normalisePixelPosition: function(pixelPosition) {
            return this.normalise(pixelPosition, 0, this.$('.linkedConfidenceSlider-item-bar').width())
        },

        showAppropriateNumbers: function() {
            switch (this.model.get('_scale')._showNumberValues) {
                case "all":
                    this.$('.linkedConfidenceSlider-scale-number').removeClass('display-none');
                    this.$('.linkedConfidenceSlider-scale-notch').removeClass('display-none');
                    break;
                case "lowHigh":
                case "highLow":
                    this.$('.linkedConfidenceSlider-scale-number').first().removeClass('display-none');
                    this.$('.linkedConfidenceSlider-scale-notch').first().removeClass('display-none');
                    this.$('.linkedConfidenceSlider-scale-number').last().removeClass('display-none');
                    this.$('.linkedConfidenceSlider-scale-notch').last().removeClass('display-none');
                    break;
                default: 
                    this.$('.linkedConfidenceSlider-scale-notch').first().removeClass('display-none');
                    this.$('.linkedConfidenceSlider-scale-notch').last().removeClass('display-none');
                    break;
            }
        },

        setScalePositions: function() {
            var numberOfItems = this.model.get('items').length;
            _.each(this.model.get('items'), function(item, index) {
                var normalisedPosition = this.normalise(index, 0, numberOfItems -1);
                this.$('.linkedConfidenceSlider-scale-number').eq(index).data('normalisedPosition', normalisedPosition);
                this.$('.linkedConfidenceSlider-scale-notch').eq(index).data('normalisedPosition', normalisedPosition);
            }, this);
        },

        onHandleDragged: function (event) {
            event.preventDefault();
            var left = (event.pageX || event.originalEvent.touches[0].pageX) - event.data.offsetLeft;
            left = Math.max(Math.min(left, event.data.width), 0);
            
            this.$('.linkedConfidenceSlider-item-handle').css({
                left: left + 'px'
            });

            this.$('.linkedConfidenceSlider-item-indicator-bar').css({
                width: left + 'px'
            });

            this.selectItem(this.mapPixelsToIndex(left));
        },
        
        onHandleFocus: function(event) {
            event.preventDefault();
            this.$('.linkedConfidenceSlider-item-handle').on('keydown', _.bind(this.onKeyDown, this));
        },
        
        onHandlePressed: function (event) {
            event.preventDefault();
            if (!this.model.get("_isEnabled") || this.model.get("_isSubmitted")) return;
            
            var eventData = {
                width:this.$('.linkedConfidenceSlider-item-bar').width(),
                offsetLeft: this.$('.linkedConfidenceSlider-item-bar').offset().left
            };
            $(document).on('mousemove touchmove', eventData, _.bind(this.onHandleDragged, this));
            $(document).one('mouseup touchend', eventData, _.bind(this.onDragReleased, this));
            this.model.set('_hasHadInteraction', true);
        },
        
        onItemBarSelected: function (event) {
            event.preventDefault();
            if (!this.model.get("_isEnabled") || this.model.get("_isSubmitted")) return;
                                
            var offsetLeft = this.$('.linkedConfidenceSlider-item-bar').offset().left,
                width = this.$('.linkedConfidenceSlider-item-bar').width(),
                left = (event.pageX || event.originalEvent.touches[0].pageX) - offsetLeft;
            
            left = Math.max(Math.min(left, width), 0);
            var nearestItemIndex = this.mapPixelsToIndex(left);
            this.selectItem(left);
            var pixelPosition = this.model.get('_scale')._snapToNumbers ? this.mapIndexToPixels(nearestItemIndex) : left;
            this.animateToPosition(pixelPosition);
            this.model.set('_hasHadInteraction', true);
        },

        onScreenSizeChanged: function() {
            var scaleWidth = this.$('.linkedConfidenceSlider-scale-notches').width(),
                $notches = this.$('.linkedConfidenceSlider-scale-notch'),
                $numbers = this.$('.linkedConfidenceSlider-scale-number');
            for(var i = 0, count = this.model.get('items').length; i < count; i++) {
                var $notch = $notches.eq(i), $number = $numbers.eq(i),
                    newLeft = Math.round($notch.data('normalisedPosition') * scaleWidth);
                $notch.css({left: newLeft});
                $number.css({left: newLeft});
            }
            var $handle = this.$('.linkedConfidenceSlider-item-handle'),
                handlePosition = Math.round($handle.data('normalisedPosition') * scaleWidth);
            $handle.css({
                left: handlePosition
            });
            this.$('.linkedConfidenceSlider-item-indicator-bar').css({
                width: handlePosition
            });
            if(!this.model.get('_isFirstPart') && this.model.get('_linkedConfidence') !== undefined) {
                this.updateLinkedConfidenceIndicator();
            }
        },
        
        setNormalisedHandlePosition: function() {
            var $handle = this.$('.linkedConfidenceSlider-item-handle');
            var normalisedPosition = this.normalisePixelPosition(parseInt($handle.css('left').slice(0, -2)));
            // cater for string-based left values such as 'auto'
            if(_.isNaN(normalisedPosition)) normalisedPosition = 0;
            $handle.data('normalisedPosition', normalisedPosition);
            this.model.set('_confidence', normalisedPosition);
        },

        getFeedbackString: function() {
            var feedbackSeparator = this.model.get('_feedback').feedbackSeparator,
                genericFeedback = this.getGenericFeedback(),
                comparisonFeedback = this.getComparisonFeedback(),
                thresholdFeedback = this.getThresholdFeedback(),
                needsSeparator = false,
                feedbackString = "";

            if(genericFeedback) {
                feedbackString += genericFeedback;
                needsSeparator = true;
            }
            if(comparisonFeedback) {
                if(needsSeparator) feedbackString += feedbackSeparator;
                feedbackString += comparisonFeedback;
                needsSeparator = true;
            }
            if(thresholdFeedback) {
                if(needsSeparator) feedbackString += feedbackSeparator;
                feedbackString += thresholdFeedback;
            }

            return feedbackString;

        },

        getComparisonFeedback: function() {
            if(this.model.get('_isFirstPart')) return;
            var confidence = this.model.get('_confidence'),
                linkedConfidence = this.model.get('_linkedModel').get('_confidence'),
                confidenceDifference = confidence - linkedConfidence,
                feedbackString;
            if (confidenceDifference < -0.01) {
                feedbackString = this.model.get('_feedback')._comparison.lower;
            } else if (confidenceDifference > 0.01) {
                feedbackString = this.model.get('_feedback')._comparison.higher;
            } else {
                feedbackString = this.model.get('_feedback')._comparison.same;
            }
            return feedbackString;
        }
    });
    
    Adapt.register("linkedConfidenceSlider", LinkedConfidenceSlider);
    
    return LinkedConfidenceSlider;
});