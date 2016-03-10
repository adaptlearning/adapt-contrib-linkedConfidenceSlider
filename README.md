# adapt-contrib-linkedConfidenceSlider

A sliding scale component that compares user confidence to a previous measurement. This is a subclass of adapt-contrib-confidenceSlider.  

[Visit the **LinkedConfidenceSlider** wiki](https://github.com/adaptlearning/adapt-contrib-linkedConfidenceSlider/wiki) for more information about its functionality and for explanations of key properties.

## Installation

* If **LinkedConfidenceSlider** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
`adapt install adapt-contrib-linkedConfidenceSlider`

    Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:  
    `"adapt-contrib-linkedConfidenceSlider": "*"`  
    Then running the command:  
    `adapt install`  
    (This second method will reinstall all plug-ins listed in *adapt.json*.)  

* If **LinkedConfidenceSlider** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  
<div float align=right><a href="#top">Back to Top</a></div>

## Usage

This component can be used as part of an assessment.

## Settings overview

A complete example of this components settings can be found in the [example.json](https://github.com/adaptlearning/adapt-contrib-linkedConfidenceSlider/blob/master/example.json) file. A description of the core settings can be found at: [Core model attributes](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes)

### Attributes

Further settings for this component are:

**_component** (string): This value must be: `linkedConfidenceSlider`

**_classes** (string): CSS class name to be applied to **LinkedConfidenceSlider**’s containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**disabledBody** (string): This is the body text shown when component is disabled.

**_linkedToId** (string): This contains the Id of confidenceSlider for which its intented to be linked.

**_feedback** (object): This element of the settings contains the feedback for this component.

>**feedbackSeparator** (string): This is the feedback seperator.

>**generic** (string): If a value is not entered for `_threshold` this feedback will be shown. Check this is correct.

>**_comparison** (object): Your feedback could be based on one of the below comparison.

>>*lower* (string): This feedback will shown up when selected value is lower than confidenceSlider's value.

>>*same* (string): This feedback will shown up when selected value is same as confidenceSlider's value.

>>*higher* (string): This feedback will shown up when selected value is higher than confidenceSlider's value.

>**_threshold** (object): You can set multiple thresholds for feedback.

>>**_values** (object): For each threshold range the following values must be set.

>>>**_low** (number): This must be a numeric value for the start of this feedback range.

>>>**_high** (number): This must be a numeric value for the end of this feedback range.

>>>**text** (string): The feedback text for this threshold range.

### Accessibility
**LinkedConfidenceSlider** has been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion**. This label is not a visible element. It is utilized by assistive technology such as screen readers. Should the region's text need to be customised, it can be found within the **globals** object in [*properties.schema*](https://github.com/adaptlearning/adapt-contrib-linkedConfidenceSlider/blob/master/properties.schema).
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

No known limitations.

----------------------------
**Version number:**  2.0   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>  
**Framework versions:** 2.0  
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-linkedConfidenceSlider/graphs/contributors)  
**Accessibility support:** WAI AA  
**RTL support:** yes  
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), IE 11, IE10, IE9, IE8, IE Mobile 11, Safari for iPhone (iOS 7+8), Safari for iPad (iOS 7+8), Safari 8, Opera  
