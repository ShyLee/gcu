
:: This batch file uses the default installation paths to runtime engine and Hq.db.
:: If you installed the app to non-default location then update the paths accordingly.

:: For Vista and Windows 7 systems, please replace the path for:
:: 1. Runtime engine: <C:\Program Files> with <C:\Program Files (x86)>
:: 2. Hq.db:  <C:\Documents and Settings\All Users> with <C:\Users\Public>


:: XP
"C:\Program Files\ARCHIBUS\21.1\Sybase\rteng9.exe" -c 1024M -x tcpip{PORT=15003} "C:\Documents and Settings\All Users\ARCHIBUS\projects\hq\data\hq.db"