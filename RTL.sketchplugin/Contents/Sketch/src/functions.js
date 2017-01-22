/** @license
 *  Copyright 2016 - present Google, Inc. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

@import 'icons.js'

var rtl = function(context) {

	var selection = context.selection;
	var count = selection.count();

	log("Running RTL v" + context.plugin.version() + "");

	//var localSelection = Array.from(selection); //breaking in sketch41
	var localSelection = selection;
	var localCount = localSelection.length;

	if (localCount == 0) {
    
		context.document.showMessage("No artboards selected. Please select one or more artboards.");
  
	} else {

		for (var i=0; i < localCount; i++) {
			
			if (check_if_artboard(localSelection[i]) == 0) {
				
				context.document.showMessage("Something other than an artboard was selected. Please select only artboards.");
				return;

			}

		}

		for (var i=0; i < localCount; i++) {

			var selectedArtboard = localSelection[i];
			var layer = localSelection[i];

			//log("Selected artboard is currently: " + selectedArtboard);

			context.document.currentPage().deselectAllLayers();

			selectedArtboard.setIsSelected(true);

			var artW = selectedArtboard.frame().width();

			var allArtboards = context.document.currentPage().artboards();

			var gutter = 100;

			for (var j = 0; j < allArtboards.count(); j++) {

				var artboard = allArtboards[j];

				if (artboard != selectedArtboard) {

					if (artboard.frame().y() == selectedArtboard.frame().y() && artboard.frame().x() > selectedArtboard.frame().x()) {
						
						artboard.frame().setX(artboard.frame().x() + artW + gutter);
					}

				}

			}

			selectedArtboard.setIsSelected(false);        
			selectedArtboard.duplicate();
			selectedArtboard.frame().setX(selectedArtboard.frame().x() + selectedArtboard.frame().width() + gutter);

			var artName = selectedArtboard.name();
			selectedArtboard.setName( artName + "_rtl");

			selectedArtboard.setIsSelected(false);

			check_layers([layer layers], ht);

		}

	}
}//END rtl

function check_layers(layers, ht){
  
	for (var x=0; x < [layers count]; x++) {
    
		var layer = layers[x];
		var layerClass = layer.class();
		var layerName = layer.name();

		var layerArtboard = layer.parentArtboard();
		var artboardFrame = layerArtboard.frame();
		var artX = artboardFrame.x();
		var artW = artboardFrame.width();

		if (layerClass == "MSShapeGroup") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			rtl_move(layer, artX, artW);

		} else if (layerClass == "MSBitmapLayer") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			rtl_move(layer, artX, artW);

		} else if (layerClass == "MSTextLayer") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			rtl_move(layer, artX, artW);
			rtl_font(layer, ht);

		} else if (layerClass == "MSSymbolInstance") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			if (rtl_svg_check(layer, ht)) {
				layer.setIsFlippedHorizontal(true);
				rtl_move(layer, artX, artW);
			} else {
				rtl_move(layer, artX, artW);
			}

		} else if (layerClass == "MSSymbolMaster") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			if (rtl_svg_check(layer, ht)) {
				layer.setIsFlippedHorizontal(true);
				rtl_move(layer, artX, artW);
			} else {
				rtl_move(layer, artX, artW);
			}

		} else if (layerClass == "MSArtboardGroup" || layerClass == "MSLayerGroup") {
		  
			//log("Found layer " + layerName + " of class: " + layerClass)
			var sublayers = [layer layers];
			
			//log("This is a group/artboard/page with " + [sublayers count] + " sublayers")

			if (rtl_svg_check(layer, ht)) {
				layer.setIsFlippedHorizontal(true);
				rtl_move(layer, artX, artW);
			} else {
				check_layers(sublayers, ht);
			}
		}

		[layer select:false byExpandingSelection:true]

	}
}//END check_layers

function starts_with_string(str, prefix) {
	
	var stringInput = String(str);
	var prefixInput = String(prefix);
	var stringSlice = stringInput.substring(0, 3);

	if (stringSlice === prefixInput) {
		return true;
	} else {
		return false;
	}
}//END starts_with_string

function rtl_svg_check(layer, ht) {
	
	var layerName = String(layer.name());

	if (starts_with_string(layerName, "ic_")) {
		//This 3 represents the first 3 characters of the layer name that we can ignore
		var clip_beginning = 3;

		//This 5 represents the last 5 characters which are the _xxdp value that we can ignore
		var clip_end = (layerName.length - 5);

		var layerNameIconName = layerName.substring(clip_beginning, clip_end);
		
		if (ht[layerNameIconName]) {
			//log("Icon name matched and should be flipped");
			return true;
		} else {
			//log("Icon does not need to be flipped");
			return false;
		}

	} else {
		return false;
	}
}//END rtl_svg_check

function rtl_font(layer, ht) {

  var layer = layer;

  var fontPS = [layer fontPostscriptName];

  var ifht = new Object();
  ifht["MaterialIcons-Regular"] = true;

  //Set the text alignment to right
  layer.setTextAlignment(1);

  var layerValue = String(layer.stringValue());

  	//Check icon against list of known icons which should be flipped
    if (ifht[fontPS]) {
      if(ht[layerValue]) {
		//log("Icon name matched and should be flipped");
        layer.setIsFlippedHorizontal(true);
      } else {
		//log("Icon does not need to be flipped");
      }
  }
}//END rtl_font

function rtl_move(layer, artX, artW) {
  
	var layerFrame = layer.frame();
	var layerAbsoluteRect = layer.absoluteRect();

	var absLayerXpos = layerAbsoluteRect.x();
	var layerWidth = layerAbsoluteRect.width();

	var trueX = (absLayerXpos - artX);

	var widthAndPos = (parseInt(layerWidth) + parseInt(trueX));

	var newLayerXpos = (artW - widthAndPos);

	var difference = (newLayerXpos - trueX);

	layerAbsoluteRect.setX(absLayerXpos + difference);
}//END rtl_move

function check_if_artboard(layer){
  
	var layerClass = layer.class();

	if(layerClass == "MSArtboardGroup") {
		return true;
	} else {
		return false;
	}
}//END check_if_artboard