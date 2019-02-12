// TestProjectWin32.cpp : Defines the entry point for the application.
//

#include "stdafx.h"
#include "MainUI.h"

#define Btn_ImportFBX 1000
#define Edit_ImportFBX 1001

#define Btn_ExportJSON 1010
#define Edit_ExportJSON 1011

#define Btn_Convert 1020

#define Edit_Status 1030

#define Btn_Minimize 1040

#define MAX_LOADSTRING 200

// Global Variables:
HINSTANCE hInst;								// current instance
TCHAR szTitle[MAX_LOADSTRING];					// The title bar text
TCHAR szWindowClass[MAX_LOADSTRING];			// the main window class name	

HWND g_wnd;

wchar_t g_importFilepath[MAX_LOADSTRING];
wchar_t g_exportFilepath[MAX_LOADSTRING];

extern bool g_minimize;

// Forward declarations of functions included in this code module:
ATOM				MyRegisterClass(HINSTANCE hInstance);
BOOL				InitInstance(HINSTANCE, int);
LRESULT CALLBACK	WndProc(HWND, UINT, WPARAM, LPARAM);
INT_PTR CALLBACK	About(HWND, UINT, WPARAM, LPARAM);

//Function declarations
void GetFbxFile(HWND a_hwnd);
void GetJSONFile(HWND a_hwnd);
//Creates the UI of the application
void CreateUI(HWND a_hwndParent);

bool CanConvert();

void AddStatusMessage(const wchar_t* a_message);

//Converts the Fbx to Json
extern bool ConvertFbxToJson(const WCHAR* a_importPath,const WCHAR* a_exportPath);

int APIENTRY _tWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPTSTR lpCmdLine,int nCmdShow)
{
	UNREFERENCED_PARAMETER(hPrevInstance);
	UNREFERENCED_PARAMETER(lpCmdLine);
	
 	// TODO: Place code here.
	MSG msg;
	HACCEL hAccelTable;	

	ZeroMemory(g_importFilepath,  sizeof(g_importFilepath)  ); 
	ZeroMemory(g_exportFilepath,  sizeof(g_exportFilepath)  ); 
	
	// Initialize global strings
	LoadString(hInstance, IDS_APP_TITLE, szTitle, MAX_LOADSTRING);
	LoadString(hInstance, IDC_FBXTOJSON, szWindowClass, MAX_LOADSTRING);
	MyRegisterClass(hInstance);	

	// Perform application initialization:
	if (!InitInstance (hInstance, nCmdShow))
	{
		return FALSE;
	}

	hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_FBXTOJSON));

	// Main message loop:
	while (GetMessage(&msg, NULL, 0, 0))
	{
		if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg))
		{
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
	}

	return (int) msg.wParam;
}

//
//  FUNCTION: MyRegisterClass()
//
//  PURPOSE: Registers the window class.
//
//  COMMENTS:
//
//    This function and its usage are only necessary if you want this code
//    to be compatible with Win32 systems prior to the 'RegisterClassEx'
//    function that was added to Windows 95. It is important to call this function
//    so that the application will get 'well formed' small icons associated
//    with it.
//
ATOM MyRegisterClass(HINSTANCE hInstance)
{
	WNDCLASSEX wcex;

	wcex.cbSize = sizeof(WNDCLASSEX);

	wcex.style			= CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc	= WndProc;
	wcex.cbClsExtra		= 0;
	wcex.cbWndExtra		= 0;
	wcex.hInstance		= hInstance;
	wcex.hIcon			= LoadIcon(hInstance, MAKEINTRESOURCE(IDI_FBXTOJSON));
	wcex.hCursor		= LoadCursor(hInstance, MAKEINTRESOURCE(IDC_ARROW));
	wcex.hbrBackground	= (HBRUSH)(COLOR_WINDOW + 1);
	wcex.lpszMenuName	= MAKEINTRESOURCE(IDC_FBXTOJSON);
	wcex.lpszClassName	= szWindowClass;
	wcex.hIconSm		= LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));

	return RegisterClassEx(&wcex);
}

//
//   FUNCTION: InitInstance(HINSTANCE, int)
//
//   PURPOSE: Saves instance handle and creates main window
//
//   COMMENTS:
//
//        In this function, we save the instance handle in a global variable and
//        create and display the main program window.
//
BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
   

   hInst = hInstance; // Store instance handle in our global variable

   g_wnd = CreateWindow(szWindowClass, szTitle,
	   WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT, CW_USEDEFAULT, 500, 600, NULL, NULL, hInstance, NULL);

   if (!g_wnd)
   {
      return FALSE;
   }

   ShowWindow(g_wnd, nCmdShow);
   UpdateWindow(g_wnd);

   return TRUE;
}

//
//  FUNCTION: WndProc(HWND, UINT, WPARAM, LPARAM)
//
//  PURPOSE:  Processes messages for the main window.
//
//  WM_COMMAND	- process the application menu
//  WM_PAINT	- Paint the main window
//  WM_DESTROY	- post a quit message and return
//
//
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	int wmId, wmEvent;
	PAINTSTRUCT ps;
	HDC hdc;	

	switch (message)
	{
		case WM_CREATE:		

			CreateUI(hWnd);
			break;
		case WM_COMMAND:
			wmId    = LOWORD(wParam);
			wmEvent = HIWORD(wParam);
			// Parse the menu selections:
			switch (wmId)
			{
				case Btn_ImportFBX:
					GetFbxFile(hWnd);
					break;
				case Btn_ExportJSON:
					GetJSONFile(hWnd);
					break;
				case Btn_Convert:
					if (CanConvert() )
					{						
						AddStatusMessage(_T("Started converting ... ... \r\n") );
						if (ConvertFbxToJson(g_importFilepath, g_exportFilepath) )
						{
							AddStatusMessage(L"Succesfully converted the fbx file to json\r\n");

							AddStatusMessage(L"DONE!\r\n");
						}
						else
						{
							AddStatusMessage(L"check the messages above me! because it failed to convert\r\n");
							AddStatusMessage(L"FAILED\r\n");
						}						
						
					}					
					break;
				case IDM_ABOUT:
					DialogBox(hInst, MAKEINTRESOURCE(IDD_ABOUTBOX), hWnd, About);
					break;
				case IDM_EXIT:
					DestroyWindow(hWnd);
					break;
				case Btn_Minimize:
				{
					bool checked = IsDlgButtonChecked(hWnd, Btn_Minimize);
					if (checked) 
					{
						CheckDlgButton(hWnd, Btn_Minimize, BST_UNCHECKED);
						g_minimize = false;
					} 
					else 
					{
						CheckDlgButton(hWnd, Btn_Minimize, BST_CHECKED);
						g_minimize = true;
					}

					break;
				}
				default:
					return DefWindowProc(hWnd, message, wParam, lParam);
			}
			break;
		
		case WM_PAINT:
			hdc = BeginPaint(hWnd, &ps);			
			
			//DrawText(hdc, L"Minimize output",

			EndPaint(hWnd, &ps);
			break;
		case WM_DESTROY:
			PostQuitMessage(0);
			break;
		default:
			return DefWindowProc(hWnd, message, wParam, lParam);
	}

	return 0;
}

//Creates the UI of the application
void CreateUI(HWND a_hwndParent)
{
	int y = 25;
	int height = 35;

	HWND hBtnImportFbx, hEditImportFbx ,hBtnExportJSON, hEditExportJSON, hBtnConvert, hEditStatus, hBtnPrettify;	

	

	hBtnImportFbx = CreateWindowEx(NULL ,_T("button") ,_T("Select FBX"),
						WS_BORDER | WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
						25,y,125,25, a_hwndParent, (HMENU) Btn_ImportFBX, hInst, NULL);

	y += height;

	hEditImportFbx = CreateWindowEx(NULL, _T("edit"), _T("Input file location"), 
				WS_BORDER | WS_CHILD | WS_VISIBLE |ES_READONLY | ES_AUTOHSCROLL, 
				25,y,300,25, a_hwndParent, (HMENU) Edit_ImportFBX, hInst, NULL);

	y += height;

	hBtnExportJSON = CreateWindowEx(NULL ,_T("button") ,_T("Select Destination"),
				WS_BORDER | WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
				25,y,125,25, a_hwndParent, (HMENU) Btn_ExportJSON, hInst, NULL);

	y += height;

	hEditExportJSON = CreateWindowEx(NULL, _T("edit"), _T("Output file location"), 
				WS_BORDER | WS_CHILD | WS_VISIBLE |ES_READONLY | ES_AUTOHSCROLL, 
				25,y,300,25, a_hwndParent, (HMENU) Edit_ExportJSON, hInst, NULL);

	y += height;

	hBtnConvert = CreateWindowEx(NULL ,_T("button") ,_T("Convert Fbx to Json"),
						WS_BORDER | WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | BS_HOLLOW,
						25,y,150,25, a_hwndParent, (HMENU) Btn_Convert, hInst, NULL);

	hBtnPrettify = CreateWindowEx(NULL, L"button", L"Minimize output", 
						WS_CHILD | WS_VISIBLE | BS_CHECKBOX,
						200, y,150,25, a_hwndParent, (HMENU) Btn_Minimize, hInst, NULL);


	y += height;

	hEditStatus = CreateWindowEx(NULL, _T("edit"), _T(""), 
						ES_AUTOHSCROLL | ES_MULTILINE | WS_HSCROLL | WS_VSCROLL | WS_CHILD | WS_VISIBLE | ES_READONLY,
						25, y, 450, 300, a_hwndParent, (HMENU) Edit_Status, hInst, NULL);

	
}

// Message handler for about box.
INT_PTR CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
	UNREFERENCED_PARAMETER(lParam);
	switch (message)
	{
		case WM_INITDIALOG:
			return (INT_PTR)TRUE;

		case WM_COMMAND:
			if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL)
			{
				EndDialog(hDlg, LOWORD(wParam));
				return (INT_PTR)TRUE;
			}
			break;
	}
	return (INT_PTR)FALSE;
}


//Gets what fbx file to read from!
void GetFbxFile(HWND a_hwnd)
{
	
	OPENFILENAME ofn;
	ZeroMemory( &ofn , sizeof( ofn));

	wchar_t szFile[MAX_LOADSTRING];
	ZeroMemory(szFile, sizeof(szFile) );
	
	ofn.lStructSize = sizeof ( ofn );
	ofn.hwndOwner = a_hwnd ;
	ofn.lpstrFile = szFile ;
	//
    // Set lpstrFile[0] to '\0' so that GetOpenFileName does not
    // use the contents of szFile to initialize itself.
    //
	ofn.lpstrFile[0] = '\0';
	ofn.nMaxFile = sizeof( szFile );	
	ofn.lpstrFilter = _T("Fbx (.fbx)\0*.fbx\0");
	ofn.nFilterIndex =1;
	ofn.lpstrFileTitle = NULL ;
	ofn.nMaxFileTitle = 0 ;
	ofn.lpstrInitialDir=NULL ;
	ofn.Flags = OFN_PATHMUSTEXIST| OFN_FILEMUSTEXIST ;

	if ( !GetOpenFileName( &ofn ) )
	{
		return;
	}	

	wcscpy(g_importFilepath, szFile);
	
	HWND importFBX = GetDlgItem(a_hwnd, Edit_ImportFBX);	

	SetWindowText(importFBX , szFile);	

	AddStatusMessage(_T("Selected a file to IMPORT\r\n") );

}

//Gets the filepath where to write the JSON file
void GetJSONFile(HWND a_hwnd)
{
	OPENFILENAME ofn;
	ZeroMemory( &ofn , sizeof( ofn));

	wchar_t szFile[MAX_LOADSTRING];
	ZeroMemory(szFile, sizeof(szFile) );
	
	ofn.lStructSize = sizeof ( ofn );
	ofn.hwndOwner = a_hwnd ;
	ofn.lpstrFile = szFile ;
	//
    // Set lpstrFile[0] to '\0' so that GetOpenFileName does not
    // use the contents of szFile to initialize itself.
    //
	ofn.lpstrFile[0] = '\0';
	ofn.nMaxFile = sizeof( szFile );	
	ofn.lpstrFilter = _T("json (.json) \0*.json\0");
	ofn.nFilterIndex =1;
	ofn.lpstrFileTitle = NULL ;
	ofn.nMaxFileTitle = 0 ;
	ofn.lpstrInitialDir=NULL ;
	ofn.lpstrDefExt = _T(".json");
	ofn.Flags = OFN_CREATEPROMPT | OFN_OVERWRITEPROMPT;

	if ( !GetSaveFileName(&ofn) )
	{
		//If someone pressed cancel!
		return;
	}

	wcscpy(g_exportFilepath, szFile);
	/*
	//Feels bad but.. the way I found it to print it!
	for (int i = 0; i < MAX_LOADSTRING; i++)
	{
		g_exportFilepath[i] = szFile[i];
	}		
	*/
	HWND exportJSON = GetDlgItem(a_hwnd, Edit_ExportJSON);	

	SetWindowText(exportJSON , szFile  );

	AddStatusMessage(_T("Selected a file to EXPORT\r\n") );

}

bool CanConvert()
{
	if (g_importFilepath[0] == '\0')
	{
		return false;
	}	

	if (g_exportFilepath[0] == '\0')
	{
		return false;
	}

	return true;
}

void AddStatusMessage(const wchar_t* a_message)
{
	SendDlgItemMessage (  g_wnd, Edit_Status, EM_REPLACESEL,  0, (LPARAM) a_message);
}

