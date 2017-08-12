using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content.Pipeline;
using Microsoft.Xna.Framework.Content.Pipeline.Graphics;
using Microsoft.Xna.Framework.Content.Pipeline.Processors;

// TODO: replace these with the processor input and output types.
using TInput = System.String;
using TOutput = System.String;

namespace ModelEffectPipeline
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
    [ContentProcessor(DisplayName = "Custom Model Processor")]
    public class CustomModelProcessor : ModelProcessor
    {
        //initialize variables
        Vector3 min = new Vector3(float.MaxValue);
        Vector3 max = new Vector3(float.MinValue);          
        /*
        float minX = -1;
        float minY = -1;
        float minZ = -1;
        float maxX = 1;
        float maxY = 1;
        float maxZ = 1;
        */


        public override ModelContent Process(NodeContent input, ContentProcessorContext context)
        {
            //rotates models to make the Y-axis point UP
            //MeshHelper.TransformScene(input,Matrix.CreateRotationX(MathHelper.ToRadians(-90)));
            
            //this part is to create a bounding BOX in the models tag property
            NodeContentCollection ncc = input.Children;

            //The input itself might actually be a mesh content, so have to check that before the children
            if (input is MeshContent)
            {
                MeshContent mc = (MeshContent)input;
                CalcMinMax(mc);
            }
            
            parseChildren(ncc);           

            ModelContent mc2 = base.Process(input, context);                   
            mc2.Tag = new BoundingBox(min, max);

            return mc2;
        }        

        private void parseChildren(NodeContentCollection ncc)
        {            
            foreach (NodeContent nc in ncc)
            {
                if (nc is MeshContent)
                {
                    MeshContent mc = (MeshContent)nc;

                    CalcMinMax(mc);                    
                }
                else
                {
                    parseChildren(nc.Children);                    
                }
            }
        }

        private void CalcMinMax(MeshContent a_mc)
        {
            foreach (Vector3 a_position in a_mc.Positions)
            {
                if (a_position.X < min.X)
                {
                    min.X = a_position.X;
                }
                if (a_position.Y < min.Y)
                {
                    min.Y = a_position.Y;
                }
                if (a_position.Z < min.Z)
                {
                    min.Z = a_position.Z;
                }
                if (a_position.X > max.X)
                {
                    max.X = a_position.X;
                }
                if (a_position.Y > max.Y)
                {
                    max.Y = a_position.Y;
                }
                if (a_position.Z > max.Z)
                {
                    max.Z = a_position.Z;
                }                
            }            
        }


        protected override MaterialContent ConvertMaterial(MaterialContent material, ContentProcessorContext context)
        {            
            return context.Convert<MaterialContent, MaterialContent>(material, "CustomMaterialProcessor", null);
        }
    }
}