using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content.Pipeline;
using Microsoft.Xna.Framework.Content.Pipeline.Graphics;
using Microsoft.Xna.Framework.Content.Pipeline.Processors;

// TODO: replace these with the processor input and output types.
using TInput = System.String;
using TOutput = System.String;

namespace ContentPipelineExtension1
{
    /// <summary>
    /// This class will be instantiated by the XNA Framework Content Pipeline
    /// to apply custom processing to content data, converting an object of
    /// type TInput to TOutput. The input and output types may be the same if
    /// the processor wishes to alter data without changing its type.
    ///
    /// This should be part of a Content Pipeline Extension Library project.
    ///
    /// TODO: change the ContentProcessor attribute to specify the correct
    /// display name for this processor.
    /// </summary>
    [ContentProcessor(DisplayName = "Custom Material Processor")]
    public class CustomMaterialProcessor : MaterialProcessor
    {
        public override MaterialContent Process(MaterialContent input, ContentProcessorContext context)
        {            
            // Create a new effect material.
            EffectMaterialContent customMaterial = new EffectMaterialContent();

            // Point the new material at our custom effect file.
            string effectFile = Path.GetFullPath("Shader/GameShader.fx");

            customMaterial.Effect = new ExternalReference<EffectContent>(effectFile);
            
            //// Copy texture data across from the original material.
            //BasicMaterialContent basicMaterial = (BasicMaterialContent)input;

            //if (basicMaterial.Texture != null)
            //{
            //    customMaterial.Textures.Add("Texture", basicMaterial.Texture);
            //    customMaterial.OpaqueData.Add("TextureEnabled", true);
            //}

            // Chain to the base material processor.
            return base.Process(customMaterial, context);
        }
    }
}