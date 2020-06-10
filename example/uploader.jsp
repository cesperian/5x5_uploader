<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.disk.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.apache.commons.fileupload.FileUploadBase.SizeLimitExceededException" %>
<%@ page import="org.apache.log4j.Logger" %>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.util.concurrent.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="com.insurezone.portal.appetite.ViewCarrierResult" %>
<%@ page import="com.insurezone.portal.jdbc.JDBCUtil" %>
<%@ page import="com.insurezone.portal.jdbc.JDBCConnection" %>
<%@ page import="com.insurezone.portal.jdbc.JDBCConnectionPool" %>
<%@ page import="com.insurezone.portal.appetite.*" %>
<%@ page import="com.insurezone.portal.xml.XMLUtil" %>
<%@ page import="com.insurezone.portal.util.PageUtil" %>
<%@ page import="com.insurezone.portal.util.LogState" %>
<%@ page import="com.insurezone.portal.util.FileFolderUtil" %>
<%@ page import="com.insurezone.portal.util.ServiceRequest" %>
<%@ page import="com.insurezone.portal.branding.BrandBag" %>
<%@ page import="com.insurezone.portal.sblob.*" %>
<%@ page import="java.nio.file.Files" %>
<%@ page import="java.nio.file.Path" %>
<%@ page import="java.nio.file.Paths" %>
<%@ page import="org.dom4j.Document" %>
<%@ page import="org.dom4j.Element" %>
<%@ page import="org.dom4j.Node" %>



<% 

	Logger logger = Logger.getLogger( this.getClass() );

  String FileName = "";

  String FileMimeType = "";

  String TempFullFileName = "";

  String UploadIndex = "";

  boolean success = false;

  boolean maxFileSizeExceeded = false;

  long actualSize = 0;

  long permittedSize = 0;  

  boolean uploadFailed = false;
  
  String uploadFailedMessage = "";
  
	List items = new ArrayList();
String test = "test";
List cefiles = new ArrayList();

  try {

    
    byte[] FileData = null;
    String fileDesc = "";
    boolean IsPrivateAttch = false;
    long longDocumentType = 0;

    DiskFileItemFactory uploadFactory = new DiskFileItemFactory();
    uploadFactory.setSizeThreshold( 1048576100 );
    ServletFileUpload upload = new ServletFileUpload( uploadFactory );
    upload.setSizeMax( 1048576000 );
	


    try {

      items = upload.parseRequest( request );

    } catch ( Exception e ) {

      logger.error( e, e );

    }
	
	
    
    Iterator iter = items.iterator();   
	
    while ( iter.hasNext() ) {

      FileItem item = (FileItem)iter.next();

      String name = item.getFieldName();
      
      if ( name.equals( "UploadIndex" ) ) {

        UploadIndex = item.getString();
		
	  }else if (name.equals( "file" )) {
		  
		  
      } else if ( name.equals( "fileee" ) ) {

        name = item.getName();
        
        FileData = item.get();

        FileName = name.substring( name.lastIndexOf( '\\' ) + 1 ).replaceAll( ",", "_" );
        
        logger.debug("FileName = " + FileName);

        FileMimeType = item.getContentType();
        
        logger.debug("FileMimeType = " + FileMimeType);

      } else if ( name.equals( "fileDesc" ) ) {

        fileDesc = item.getString();
      
      } else if ( name.equals( "AttachmentIsPrivate") ) {
      
        IsPrivateAttch = PageUtil.number(item.getString()) == 1;
        
      } else if ( name.equals( "AttachmentDocType") ) {
        
        longDocumentType = PageUtil.number(item.getString());
        
      }

    }
	
	/*
	
    if ( FileData != null ) {
      
      String fileName = "" + FileName; //FileFolderUtil.CleanFileName(FileName, "");
      
      if ( destination.equals( "secureBlob" ) ) {

        String srBrand = "";
        String srAcctName = "";
        String srUserName = "";
      
        long lID = PageUtil.number( svrqId );
        String ShortDescription = fileDesc;

        JDBCConnectionPool pool = JDBCUtil.getPool( "data" );

        JDBCConnection c = pool.getConnection();
        
        try {
        
          PreparedStatement ps = c.getPreparedStatement( "GetServiceRequest" );

          ps.setLong( 1, lID );

          ResultSet rs = ps.executeQuery();

          if ( rs.next() ) {

            srBrand = rs.getString( "SvRqAccountBrand" );
            srAcctName = rs.getString( "SvRqAccountName" );
            srUserName = rs.getString( "SvRqUserName" );

          }

          rs.close();

        } catch ( Exception e ) {

          logger.error( e ,e );
          
        } finally {

           pool.releaseConnection( c );
        }      
      
        FileName = FileName.trim().replaceAll( "\\?", " " ).replaceAll( "\\s+", " " ).replaceAll( "[^\\p{Graph}\\p{Blank}]", "" ); //normalize white space

        SecureBLOB sblob = new SecureBLOB( srBrand, FileData, FileName, FileMimeType );
        sblob.save();

        long SecureBlobId = sblob.getFileID();
        String fullFileName = sblob.getFullFileName();

        c = pool.getConnection();
        
        try {

          long SRqIId = 0;
          String assignedTo = "";
          String status = "";
          String isWorking = "";
          java.sql.Date ActionDate = null;
          String ActionNote = "";
        
          PreparedStatement ps = c.getPreparedStatement( "GetServiceRequestInfoCurrent" );
          ps.setLong( 1, lID );
          ResultSet rs = ps.executeQuery();

          if ( rs.next() ) {

            SRqIId = rs.getInt( "SRqIId" );
            assignedTo = rs.getString( "SRqIAssignedTo" );
            status = rs.getString( "SRqIStatusCode" );
            isWorking = rs.getString( "SRqIWorkingRequest" );
            ActionDate = rs.getDate( "SRqIActionDate" );
            ActionNote = PageUtil.toString( rs.getString( "SRqIActionNote" ) );
            
          }

          rs.close();

          String choppedFileName = PageUtil.Chop( FileName, 80 );
          String choppedShortDescription = PageUtil.Chop( ShortDescription, 80 );
          
          String Note = "Uploaded file " + choppedFileName + ": " + choppedShortDescription;

          SRqIId = ServiceRequest.insertNote(
              Note,
              lID,
              c,
              loginState.isAdmin(),
              status,
              assignedTo,
              isWorking,
              ActionNote,
              ActionDate,
              loginState.getUserName(),
              IsPrivateAttch
            );

          ps = c.getPreparedStatement( "InsertServiceRequestGeneralAttachment" );

          ps.setLong( 1, lID );
          ps.setLong( 2, SRqIId );
          ps.setLong( 3, SecureBlobId );
          ps.setString( 4, choppedFileName );
          ps.setString( 5, choppedShortDescription );
          ps.setBoolean( 6, IsPrivateAttch );
          ps.setLong( 7, longDocumentType );

          int count = ps.executeUpdate();
          if ( count > 0 ) c.commit();

        //remove variables from session
          session.removeAttribute( "izDropTempFile" );
          session.removeAttribute( "izDropFileName" );

        } catch ( Exception e ) {

          logger.error( e ,e );
          
        } finally {

          pool.releaseConnection( c );

        }      
      
      } else {

        ConcurrentHashMap<String,String> fileBag = new ConcurrentHashMap<String,String>();
        fileBag.put( "name", fileName );
        fileBag.put( "desc", fileDesc );
        fileBag.put( "userName", loginState.getUserName() );
        fileBag.put( "brand", loginState.getAcctBrand() );
        fileBag.put( "accountName", loginState.getAcctName() );
        fileBag.put( "userIsAdmin", "" + loginState.isAdmin() );
        fileBag.put( "documentType", "" + longDocumentType );

        File tempFile = FileFolderUtil.SaveFile( folderIdPath, FileName, FileData, fileBag );

        if ( tempFile != null ) {

          TempFullFileName = tempFile.getAbsolutePath();

          logger.debug("TempFullFileName = " + TempFullFileName);

          // session.setAttribute( "izDropTempFile" + UploadIndex, tempFile );

          // session.setAttribute( "izDropFileName" + UploadIndex, FileName );

          success = true;

        }
        
      }

    }
	
	*/

  } catch ( Exception e ) {

    logger.error( e, e );

  }

%>

<%=test%>
