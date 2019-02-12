/****************************************************************************************

   Copyright (C) 2011 Autodesk, Inc.
   All rights reserved.

   Use of this software is subject to the terms of the Autodesk license agreement
   provided at the time of installation or download, or which otherwise accompanies
   this software in either electronic or hard copy form.

****************************************************************************************/

//
// Specify the fbxsdk lib of the FBX SDK package we must link with
// and lib we must exclude
//

// Dont forget to set the path to the FBX SDK Lib in 
// <Additional Library Directories> of your project
// Ex: "C:\Program Files\Autodesk\FBX\FbxSdk\2006.11.1\lib"
#if (_MSC_VER == 1500)
    #if defined(WIN32)

        #if defined( _MT) && !defined(_DLL) // if this is a Multi-threaded /MT or MTd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_mt2008d.lib")
            #else
                #pragma comment(lib, "fbxsdk_mt2008.lib")
            #endif

        #elif defined( _MT) && defined(_DLL) // if this is a Multi-threaded DLL /MD or /MDd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_md2008d.lib")
            #else
                #pragma comment(lib, "fbxsdk_md2008.lib" )
            #endif

        #else

            #error No FbxSdk library available for this compilation.

        #endif
    #elif defined (WIN64)
        #if defined( _MT) && !defined(_DLL) // if this is a Multi-threaded /MT or MTd project
            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_mt2008_amd64d.lib")
            #else
                #pragma comment(lib, "fbxsdk_mt2008_amd64.lib")
            #endif

        #elif defined( _MT) && defined(_DLL) // if this is a Multi-threaded DLL /MD or /MDd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_md2008_amd64d.lib")
            #else
                #pragma comment(lib, "fbxsdk_md2008_amd64.lib" )
            #endif

        #else
            #error No FbxSdk library available for this compilation.
        #endif
    #endif //if win32 or win64
#elif (_MSC_VER == 1400)
    #if defined(WIN32)

        #if defined( _MT) && !defined(_DLL) // if this is a Multi-threaded /MT or MTd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_mt2005d.lib")
            #else
                #pragma comment(lib, "fbxsdk_mt2005.lib")
            #endif

        #elif defined( _MT) && defined(_DLL) // if this is a Multi-threaded DLL /MD or /MDd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_md2005d.lib")
            #else
                #pragma comment(lib, "fbxsdk_md2005.lib" )
            #endif

        #else

            #error No FbxSdk library available for this compilation.

        #endif
    #elif defined (WIN64)
        #if defined( _MT) && !defined(_DLL) // if this is a Multi-threaded /MT or MTd project
            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_mt2005_amd64d.lib")
            #else
                #pragma comment(lib, "fbxsdk_mt2005_amd64.lib")
            #endif

        #elif defined( _MT) && defined(_DLL) // if this is a Multi-threaded DLL /MD or /MDd project

            #ifdef _DEBUG
                #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
                #pragma comment(lib, "fbxsdk_md2005_amd64d.lib")
            #else
                #pragma comment(lib, "fbxsdk_md2005_amd64.lib" )
            #endif

        #else
            #error No FbxSdk library available for this compilation.
        #endif
    #endif //if win32 or win64
#elif (_MSC_VER == 1310 )

    #if defined( _MT) && !defined(_DLL) // if this is a Multi-threaded /MT or MTd project

        #ifdef _DEBUG
            #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
            #pragma comment(lib, "fbxsdk_mt2003d.lib")
        #else
            #pragma comment(lib, "fbxsdk_mt2003.lib")
        #endif

    #elif defined( _MT) && defined(_DLL) // if this is a Multi-threaded DLL /MD or /MDd project

        #ifdef _DEBUG
            #pragma comment(linker, "/nodefaultlib:libcmt.lib") // exclude a lib
            #pragma comment(lib, "fbxsdk_md2003d.lib")
        #else
            #pragma comment(lib, "fbxsdk_md2003.lib" )
        #endif
	#elif !defined( _MT) && !defined(_DLL) // if this is a Single Thread ML

        #ifdef _DEBUG
            #pragma comment(linker, "/nodefaultlib:libc.lib") // exclude a lib
            #pragma comment(lib, "fbxsdk_ml2003d.lib")
        #else
            #pragma comment(lib, "fbxsdk_ml2003.lib" )
        #endif
    #else
        #error No FbxSdk library available for this compilation.

    #endif

#endif //VS2005

//-----------------------------------------------------------------------------------