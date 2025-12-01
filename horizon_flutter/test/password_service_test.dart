import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/core/services/password_service.dart';
import 'package:horizon_flutter/core/models/credential.dart';

void main() {
  group('PasswordService', () {
    const passwordService = PasswordService();

    group('generatePassword', () {
      test('generates password of default length', () {
        final password = passwordService.generatePassword();
        expect(password.length, 16);
      });

      test('generates password of custom length', () {
        final password = passwordService.generatePassword(
          const PasswordOptions(length: 24),
        );
        expect(password.length, 24);
      });

      test('generates password with only lowercase', () {
        final password = passwordService.generatePassword(
          const PasswordOptions(
            length: 20,
            includeLowercase: true,
            includeUppercase: false,
            includeNumbers: false,
            includeSymbols: false,
          ),
        );
        expect(password, matches(RegExp(r'^[a-z]+$')));
      });

      test('generates password with only uppercase', () {
        final password = passwordService.generatePassword(
          const PasswordOptions(
            length: 20,
            includeLowercase: false,
            includeUppercase: true,
            includeNumbers: false,
            includeSymbols: false,
          ),
        );
        expect(password, matches(RegExp(r'^[A-Z]+$')));
      });

      test('generates password with only numbers', () {
        final password = passwordService.generatePassword(
          const PasswordOptions(
            length: 20,
            includeLowercase: false,
            includeUppercase: false,
            includeNumbers: true,
            includeSymbols: false,
          ),
        );
        expect(password, matches(RegExp(r'^[0-9]+$')));
      });

      test('generates unique passwords', () {
        final passwords = <String>{};
        for (var i = 0; i < 100; i++) {
          passwords.add(passwordService.generatePassword());
        }
        // All passwords should be unique
        expect(passwords.length, 100);
      });
    });

    group('assessStrength', () {
      test('returns weak for empty password', () {
        final strength = passwordService.assessStrength('');
        expect(strength.level, PasswordStrengthLevel.weak);
        expect(strength.score, 0);
      });

      test('returns weak for short password', () {
        final strength = passwordService.assessStrength('abc');
        expect(strength.level, PasswordStrengthLevel.weak);
      });

      test('returns moderate for medium strength password', () {
        final strength = passwordService.assessStrength('Password1');
        expect(strength.level, PasswordStrengthLevel.moderate);
      });

      test('returns strong for complex password', () {
        final strength = passwordService.assessStrength('MyP@ssw0rd!123ABC');
        expect(strength.level, PasswordStrengthLevel.strong);
      });

      test('provides suggestions for weak passwords', () {
        final strength = passwordService.assessStrength('password');
        expect(strength.suggestions, isNotEmpty);
        expect(strength.suggestions, contains('Add uppercase letters'));
        expect(strength.suggestions, contains('Add numbers'));
        expect(strength.suggestions, contains('Add special characters'));
      });

      test('score increases with length', () {
        final short = passwordService.assessStrength('abcd');
        final medium = passwordService.assessStrength('abcdefghijkl');
        final long = passwordService.assessStrength('abcdefghijklmnop');

        expect(medium.score, greaterThan(short.score));
        expect(long.score, greaterThan(medium.score));
      });

      test('score increases with character variety', () {
        final lower = passwordService.assessStrength('abcdefgh');
        final lowerUpper = passwordService.assessStrength('abcdEFGH');
        final lowerUpperNum = passwordService.assessStrength('abcdEF12');
        final all = passwordService.assessStrength('abcEF12!');

        expect(lowerUpper.score, greaterThan(lower.score));
        expect(lowerUpperNum.score, greaterThan(lowerUpper.score));
        expect(all.score, greaterThan(lowerUpperNum.score));
      });
    });
  });
}
