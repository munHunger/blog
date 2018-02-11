import { Component } from '@angular/core';

@Component({
    selector: 'code-block',
    templateUrl: './code.component.html',
    styleUrls: ['./code.component.css']
})
export class CodeComponent {
    private specialRegex = /(\n|\t)|(".*"|true|false|([0-9]+(\.[0-9]*)?(d|l|f)?))|([^a-zA-Z0-9_@]+?)|(if|else|for|while|switch|return|break|do|throws|throw|implements|extends|public|private|protected|class|new|extends|throws|void|boolean|int|float|long|double)|((?<= |\n|\()@?[A-Z][a-zA-Z]*)|((?<= |\n|\()[a-z][a-zA-Z]*\()|(.+?)/g;
    
    private code = "public class UserService {\n" +
        "\t@Inject\n" +
        "\tprivate UserDAO userDAO;\n" +
        "\tpublic void createUser(User user) throws NoSuchAlgorithmException, EmailNotValidException {\n" +
            "\t\tuser.setHashPassword(HashPass.hashPassword(user.getHashPassword()));\n" +
            "\t\tif (!EmailValidation.isValidEmailAddress(user.getEmail()))\n" +
                    "\t\t\tthrow new EmailNotValidException();\n" +
            "\t\tuserDAO.createUser(user);\n" +
        "\t}\n" +
        "\tpublic User getUser(String username) throws NotInDatabaseException {\n" +
            "\t\treturn userDAO.getUser(username).orElseThrow(NotInDatabaseException::new);\n" +
        "\t}\n" +
        "\tpublic void updateUser(User user) throws NoSuchAlgorithmException, NotInDatabaseException, EmailNotValidException {\n" +
            "\t\tuser.setHashPassword(HashPass.hashPassword(user.getHashPassword()));\n" +
            "\t\tif (!EmailValidation.isValidEmailAddress(user.getEmail()))\n" +
                "\t\t\tthrow new EmailNotValidException();\n" +
            "\t\tuserDAO.updateUser(user);\n" +
        "\t}\n" +
        "\tpublic void deleteUser(String username) throws NotInDatabaseException {\n" +
            "\t\tuserDAO.deleteUser(\"pelle\");\n" +
        "\t}\n" +
    "}\n";

    public codeSplit(): WordInfo[]{
        let result = [];
        let match;
        while(match = this.specialRegex.exec(this.code)){
            let word = new WordInfo();
            word.word = match[0];
            if(match[2])
                word.literal = true;
            if(match[7])
                word.keyword = true;
            if(match[8])
                word.object = true;
            if(match[9])
                word.function = true;
            result.push(word);
        }
        return result;
    }
}
class WordInfo{
    public word: string;
    public keyword: boolean;
    public literal: boolean;
    public object: boolean;
    public function: boolean;
}
