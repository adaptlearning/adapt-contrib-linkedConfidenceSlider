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
            'blur .linkedConfidenceSlider-item-handle':'onHandleBlur'
        },

        // Used by question to setup itself just before rendering
        setupQuestion: function() {
            this.setupLinkedModel();
            if(!this.model.get('_items')) {
                this.setupModelItems();
            }
            this.model.set({
                _selectedItem: {}
            });
            this.checkAndDisableInteraction();
        },

        setupLinkedModel: function() {
            var linkedModel = Adapt.components.findWhere({_id: this.model.get('_linkedToId')});
            this.model.set('_scale', _.clone(linkedModel.get('_scale')));
            this.model.set('axisLabel', linkedModel.get('axisLabel'));
            this.model.set('_linkedModel', linkedModel);
        },

        setAllItemsEnabled: function(isEnabled) {
            if (isEnabled) {
                this.$('.linkedConfidenceSlider-widget').removeClass('disabled');
            } else {
                this.$('.linkedConfidenceSlider-widget').addClass('disabled');
            }
        },

        // Used by question to setup itself just after rendering
        onQuestionRendered: function() {
            this.setScalePositions();
            this.showAppropriateNumbers();
            this.listenToLinkedModel();
            if(this.model.get('_linkedModel').get('_isSubmitted')) {
                this.onLinkedConfidenceChanged(this.model.get('_linkedModel'));
            } else {
                this.$('.linkedConfidenceSlider-body').html(this.model.get('disabledBody'));
            }
            this.setNormalisedHandlePosition();
            this.onScreenSizeChanged();
            this.showScaleMarker(true);
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.setAltText(this.model.get('_scaleStart'));
            this.setReadyStatus();
        },

        listenToLinkedModel: function() {
            this.listenTo(this.model.get('_linkedModel'), 'change:_confidence', this.onLinkedConfidenceChanged);
            this.listenTo(this.model.get('_linkedModel'), 'change:_isSubmitted', this.onLinkedSubmittedChanged);
        },

        // this should make the slider handle and slider bar to animate to give position
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

        // this should set given value to slider handle
        setAltText: function(value) {
            this.$('.linkedConfidenceSlider-item-handle').attr('alt', value);
        },

        resetQuestion: function(properties) {
            this.model.set({
                _linkedConfidence: 0
            });
            this.selectItem(0);
            this.animateToPosition(0);
            this.setAltText(this.model.get('_scale')._low);
            this.checkAndDisableInteraction();
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
            this.$('.linkedConfidenceSlider-widget').removeClass('disabled show-user-answer');
            this.$('.linkedConfidenceSlider-body').html(this.model.get('body'));
        },

        updateLinkedConfidenceIndicator: function() {
            this.$('.linkedConfidenceSlider-item-linked-confidence-bar').css({
                width: this.$('.linkedConfidenceSlider-item-bar').width() * this.model.get('_linkedConfidence')
            })
        },

        mapIndexToPixels: function(value) {
            var numberOfItems = this.model.get('_items').length,
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
            var numberOfItems = this.model.get('_items').length;
            _.each(this.model.get('_items'), function(item, index) {
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

        onHandleBlur: function(event) {
            event.preventDefault();
            this.$('.linkedConfidenceSlider-item-handle').off('keydown');
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

        onKeyDown: function(event) {
            this.model.set('_hasHadInteraction', true);
            if(event.which == 9) return; // tab key
            event.preventDefault();

            var newItemIndex = this.getIndexFromValue(this.model.get('_selectedItem').value);

            switch (event.which) {
                case 40: // ↓ down
                case 37: // ← left
                    newItemIndex = Math.max(newItemIndex - 1, 0);
                    break;
                case 38: // ↑ up
                case 39: // → right
                    newItemIndex = Math.min(newItemIndex + 1, this.model.get('_scale')._high - 1);
                    break;
            }

            this.selectItem(newItemIndex);
            if(typeof newItemIndex == "number") this.showScaleMarker(true);
            this.animateToPosition(this.mapIndexToPixels(newItemIndex));
            this.setAltText(newItemIndex + 1);
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
            this.setAltText(nearestItemIndex + 1);
        },

        onScreenSizeChanged: function() {
            var scaleWidth = this.$('.linkedConfidenceSlider-scale-notches').width(),
                $notches = this.$('.linkedConfidenceSlider-scale-notch'),
                $numbers = this.$('.linkedConfidenceSlider-scale-number');
            for(var i = 0, count = this.model.get('_items').length; i < count; i++) {
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
            if(this.model.get('_linkedConfidence') !== undefined) {
                this.updateLinkedConfidenceIndicator();
            }
        },

        //Use to check if the user is allowed to submit the question
        canSubmit: function() {
            if(this.model.get('_isEnabled') && this.model.get('_linkedModel').get('_isSubmitted')) {
                return true;
            } else {
                return false;
            }
        },

        checkAndDisableInteraction: function() {
            if (!this.model.get('_linkedModel').get('_isSubmitted')) {
                this.model.set('_isEnabled', false);
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
